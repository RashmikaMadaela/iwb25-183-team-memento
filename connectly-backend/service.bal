import ballerina/http;
import ballerina/log;
import ballerina/sql;
import ballerina/crypto;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "POST"]
    }
}
service / on new http:Listener(9090) {

    // GET /initiatives
    resource function get initiatives() returns Initiative[]|http:InternalServerError|error {
        sql:ParameterizedQuery query = `SELECT id, title, description, location, event_date, (SELECT name FROM users WHERE users.id = initiatives.organization_id) AS creator_name, created_at FROM initiatives ORDER BY created_at DESC`;
        stream<Initiative, sql:Error?> resultStream = dbClient->query(query);
        Initiative[]|sql:Error initiativesResult = from var row in resultStream select row;
        if initiativesResult is sql:Error {
            log:printError("Database query failed", 'error = initiativesResult);
            // --- FIX APPLIED HERE ---
            return <http:InternalServerError>{body: "Database error occurred"};
        }
        foreach int i in 0..<initiativesResult.length() {
            int initiativeId = initiativesResult[i].id ?: -1;
            if initiativeId != -1 {
                sql:ParameterizedQuery participantQuery = `SELECT participant_name FROM participants WHERE initiative_id = ${initiativeId}`;
                stream<Participant, sql:Error?> participantStream = dbClient->query(participantQuery);
                Participant[]|sql:Error participants = from var p_row in participantStream select p_row;
                if participants is Participant[] {
                    initiativesResult[i].participants = participants;
                }
            }
        }
        return initiativesResult;
    }

// POST /initiatives
resource function post initiatives(@http:Payload json payload) returns Initiative|http:InternalServerError|error {
    
    // Manually create the Initiative record, now including organization_id
    Initiative newInitiative = {
        id: (),
        title: check payload.title.ensureType(),
        description: check payload.description.ensureType(),
        location: check payload?.location.ensureType(),
        creator_name: (), // Not needed for creation
        event_date: check payload?.event_date.ensureType(),
        created_at: (),
        participants: (),
        organization_id: check payload.organization_id.ensureType() // <-- GET IT HERE
    };

    // The SQL query is now simpler and uses the clean data from our record
    sql:ParameterizedQuery query = `INSERT INTO initiatives (title, description, location, event_date, organization_id) 
                                     VALUES (${newInitiative.title}, ${newInitiative.description}, ${newInitiative.location}, ${newInitiative.event_date}, ${newInitiative.organization_id})`;
    
    sql:ExecutionResult|sql:Error result = dbClient->execute(query);
    if result is sql:Error {
        log:printError("Database insert failed", 'error = result);
        return <http:InternalServerError>{body: "Database error occurred"};
    }
    int|string newId = result.lastInsertId ?: -1;
    
    Initiative createdInitiative = {
        id: <int>newId,
        title: newInitiative.title,
        description: newInitiative.description,
        location: newInitiative.location,
        event_date: newInitiative.event_date,
        creator_name: "", // Will be populated by GET, but needs a value
        created_at: "",
        participants: [],
        organization_id: newInitiative.organization_id
    };
    return createdInitiative;
}

    // POST /participants
    resource function post participants(@http:Payload json payload) returns http:Created|http:InternalServerError|error {
        int initiativeId = check payload.initiative_id.ensureType();
        string participantName = check payload.participant_name.ensureType();
        sql:ParameterizedQuery query = `INSERT INTO participants (initiative_id, participant_name) VALUES (${initiativeId}, ${participantName})`;
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
            // On success, return a simple success message with user details.
            return {
                message: "Login Successful!",
                user: {
                    id: userResult.id,
                    name: userResult.name,
                    email: userResult.email,
                    role: userResult.role
                }
            };
        }
    }
}