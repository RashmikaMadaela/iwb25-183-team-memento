import ballerina/http;
import ballerina/log;
import ballerina/sql;
import ballerina/crypto;
import ballerina/uuid;

// --- In-Memory Session Store ---
// Stores active sessions: the key is the session ID, the value is the User.
map<User> sessionStore = {};

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST"]
    }
}
service / on new http:Listener(9090) {

    // GET /initiatives (Publicly accessible with search)
    // GET /initiatives (Publicly accessible with search)
resource function get initiatives(@http:Query string? search = ()) returns Initiative[]|http:InternalServerError|error {
    sql:ParameterizedQuery query;
    if search is string && search != "" {
        string searchTerm = "%" + search + "%";
        query = `SELECT id, title, description, location, event_date, (SELECT name FROM users WHERE users.id = initiatives.organization_id) AS creator_name, created_at 
                 FROM initiatives 
                 WHERE title LIKE ${searchTerm} OR description LIKE ${searchTerm}
                 ORDER BY created_at DESC`;
    } else {
        query = `SELECT id, title, description, location, event_date, (SELECT name FROM users WHERE users.id = initiatives.organization_id) AS creator_name, created_at 
                 FROM initiatives 
                 ORDER BY created_at DESC`;
    }

    stream<Initiative, sql:Error?> resultStream = dbClient->query(query);
    Initiative[]|sql:Error initiativesResult = from var row in resultStream select row;
    if initiativesResult is sql:Error {
        log:printError("Database query failed on GET /initiatives", 'error = initiativesResult);
        return <http:InternalServerError>{body: "Database error occurred"};
    }

    foreach int i in 0..<initiativesResult.length() {
        int initiativeId = initiativesResult[i].id ?: -1;
        if initiativeId != -1 {
            // --- START: CORRECTED QUERY ---
            // This query now correctly joins the participants and users tables
            // to get the name of each participant.
            sql:ParameterizedQuery participantQuery = `
                SELECT u.name AS participant_name 
                FROM participants p
                JOIN users u ON p.user_id = u.id
                WHERE p.initiative_id = ${initiativeId}`;
            // --- END: CORRECTED QUERY ---
            
            stream<Participant, sql:Error?> participantStream = dbClient->query(participantQuery);
            Participant[]|sql:Error participants = from var p_row in participantStream select p_row;
            if participants is Participant[] {
                initiativesResult[i].participants = participants;
            }
        }
    }
    return initiativesResult;
}

    // POST /initiatives (Secured with Session ID)
resource function post initiatives(@http:Header string x_session_id, @http:Payload json payload) returns http:Created|http:InternalServerError|http:Unauthorized|error {
    User? loggedInUser = sessionStore[x_session_id];
    if loggedInUser is () {
        return <http:Unauthorized>{body: "Invalid session"};
    }

    if loggedInUser.role != "organization" {
        return <http:Unauthorized>{body: "Only organizations can create initiatives"};
    }

    int organizationId = loggedInUser.id ?: -1;

    // --- START NEW LOGIC ---
    // Manually format the date to be MySQL-friendly.
    string? eventDateFromPayload = check payload?.event_date.ensureType();
    // assume eventDateFromPayload is a string from payload
string? mysqlEventDate = ();
if eventDateFromPayload is string {
    // common ISO forms: "2025-08-29T00:00:00Z" or "2025-08-29T00:00:00.000Z" or with offset "+05:30"
    int tIdx = eventDateFromPayload.indexOf("T") ?: -1;
    string norm = eventDateFromPayload;
    if tIdx != -1 {
        norm = eventDateFromPayload.substring(0, tIdx) + " " + eventDateFromPayload.substring(tIdx + 1);
    }

    // remove trailing 'Z' if present
    if norm.endsWith("Z") {
        norm = norm.substring(0, norm.length() - 1);
    }

    // strip timezone offsets like "+05:30" or "-04:00"
    int plusIdx = norm.lastIndexOf("+") ?: 0;
    int minusIdx = norm.lastIndexOf("-") ?: 0;
    int tzIdx = plusIdx > minusIdx ? plusIdx : minusIdx;
    if tzIdx > 10 { // reasonable guard: timezone won't appear before date part
        norm = norm.substring(0, tzIdx);
    }

    // truncate fractional seconds if present (.123)
    int dotIdx = norm.indexOf(".") ?: 0;
    if dotIdx != -1 {
        // keep up to seconds
        norm = norm.substring(0, dotIdx);
    }

    // ensure length is at most 19: "YYYY-MM-DD HH:MM:SS"
    if norm.length() > 19 {
        norm = norm.substring(0, 19);
    }

    mysqlEventDate = norm;
}
    // --- END NEW LOGIC ---

    record {string title; string description; string? location;} newInitiativeData = {
        title: check payload.title.ensureType(),
        description: check payload.description.ensureType(),
        location: check payload?.location.ensureType()
    };

    sql:ParameterizedQuery query = `INSERT INTO initiatives (title, description, location, event_date, organization_id) 
                                     VALUES (${newInitiativeData.title}, ${newInitiativeData.description}, ${newInitiativeData.location}, ${mysqlEventDate}, ${organizationId})`;

    sql:ExecutionResult|sql:Error result = dbClient->execute(query);
    if result is sql:Error {
        log:printError("Database insert failed on POST /initiatives", 'error = result);
        return <http:InternalServerError>{body: "Database error occurred"};
    }
    return http:CREATED;
}

    // POST /participants (Secured with Session ID)
    resource function post participants(@http:Header string x_session_id, @http:Payload json payload) returns http:Created|http:InternalServerError|http:Unauthorized|error {
        User? loggedInUser = sessionStore[x_session_id];
        if loggedInUser is () {
            return <http:Unauthorized>{body: "Invalid session. Please log in again."};
        }
        if loggedInUser.role != "volunteer" {
            return <http:Unauthorized>{body: "Only volunteers can join initiatives."};
        }
        int initiativeId = check payload.initiative_id.ensureType();
        int userId = loggedInUser.id ?: -1; // Get the user's ID from the session
        sql:ParameterizedQuery query = `INSERT INTO participants (initiative_id, user_id) VALUES (${initiativeId}, ${userId})`;
        
        sql:ExecutionResult|sql:Error result = dbClient->execute(query);
        if result is sql:Error {
            log:printError("Failed to add participant", 'error = result);
            return <http:InternalServerError>{body: "Database error occurred"};
        }
        return http:CREATED;
    }

    // POST /register
    resource function post register(@http:Payload json payload) returns http:Created|http:InternalServerError|error {
        string name = check payload.name.ensureType();
        string email = check payload.email.ensureType();
        string password = check payload.password.ensureType();
        string role = check payload.role.ensureType();

        if password is "" {
            return <http:InternalServerError>{body: "Password is required"};
        }
        byte[] passwordHash = crypto:hashSha256(password.toBytes());

        sql:ParameterizedQuery query = `INSERT INTO users (name, email, password, role) VALUES (${name}, ${email}, ${passwordHash}, ${role})`;
        
        sql:ExecutionResult|sql:Error result = dbClient->execute(query);
        if result is sql:Error {
            log:printError("User registration failed", 'error = result);
            return <http:InternalServerError>{body: "Could not register user"};
        }
        return http:CREATED;
    }

    // POST /login
    resource function post login(@http:Payload json payload) returns json|http:Unauthorized|http:InternalServerError|error {
        string email = check payload.email.ensureType();
        string password = check payload.password.ensureType();
        sql:ParameterizedQuery findUserQuery = `SELECT id, name, email, password, role FROM users WHERE email = ${email} LIMIT 1`;
        User|sql:Error|() userResult = dbClient->queryRow(findUserQuery);

        if userResult is sql:Error {
            log:printError("Database query failed during login", 'error = userResult);
            return <http:InternalServerError>{body: "Login failed"};
        } else if userResult is () {
            return <http:Unauthorized>{body: "Invalid credentials"};
        } else {
            if userResult.password is () {
                return <http:Unauthorized>{body: "Invalid credentials"};
            }
            byte[] storedPasswordHash = userResult.password ?: [];
            byte[] providedPasswordHash = crypto:hashSha256(password.toBytes());
            boolean passwordsMatch = (storedPasswordHash == providedPasswordHash);

            if !passwordsMatch {
                return <http:Unauthorized>{body: "Invalid credentials"};
            }

            string sessionId = uuid:createType4AsString();
            sessionStore[sessionId] = userResult;

            return { "session_id": sessionId, "user": userResult };
        }
    }
}