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
    resource function get initiatives(@http:Query string? search = ()) returns Initiative[]|http:InternalServerError|error {
        // --- START: Search Logic ---
        sql:ParameterizedQuery query;
        if search is string && search != "" {
            // If a search term is provided, add a WHERE clause
            string searchTerm = "%" + search + "%";
            query = `SELECT id, title, description, location, event_date, (SELECT name FROM users WHERE users.id = initiatives.organization_id) AS creator_name, created_at 
                     FROM initiatives 
                     WHERE title LIKE ${searchTerm} OR description LIKE ${searchTerm}
                     ORDER BY created_at DESC`;
        } else {
            // If no search term, get all initiatives
            query = `SELECT id, title, description, location, event_date, (SELECT name FROM users WHERE users.id = initiatives.organization_id) AS creator_name, created_at 
                     FROM initiatives 
                     ORDER BY created_at DESC`;
        }
        // --- END: Search Logic ---

        stream<Initiative, sql:Error?> resultStream = dbClient->query(query);
        Initiative[]|sql:Error initiativesResult = from var row in resultStream select row;
        if initiativesResult is sql:Error {
            log:printError("Database query failed on GET /initiatives", 'error = initiativesResult);
            return <http:InternalServerError>{body: "Database error occurred"};
        }

        foreach int i in 0..<initiativesResult.length() {
            int initiativeId = initiativesResult[i].id ?: -1;
            if initiativeId != -1 {
                sql:ParameterizedQuery participantQuery = `SELECT user_id, (SELECT name FROM users WHERE users.id = participants.user_id) AS participant_name FROM participants WHERE initiative_id = ${initiativeId}`;
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
            return <http:Unauthorized>{body: "Invalid session. Please log in again."};
        }
        if loggedInUser.role != "organization" {
            return <http:Unauthorized>{body: "Only organizations can create initiatives."};
        }
        int organizationId = loggedInUser.id ?: -1;
        
        record {string title; string description; string? location; string? event_date;} newInitiativeData = {
            title: check payload.title.ensureType(),
            description: check payload.description.ensureType(),
            location: check payload?.location.ensureType(),
            event_date: check payload?.event_date.ensureType()
        };
        sql:ParameterizedQuery query = `INSERT INTO initiatives (title, description, location, event_date, organization_id) 
                                         VALUES (${newInitiativeData.title}, ${newInitiativeData.description}, ${newInitiativeData.location}, ${newInitiativeData.event_date}, ${organizationId})`;
        
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