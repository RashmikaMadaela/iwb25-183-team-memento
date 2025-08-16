import ballerina/http;
import ballerina/log;
import ballerina/sql;
// ...existing imports...

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"], // Allows frontend to connect (we'll make this more secure later)
        allowMethods: ["GET", "POST"]
    }
}
service / on new http:Listener(9090) {

    // GET /initiatives
    resource function get initiatives() returns Initiative[]|http:InternalServerError {
        sql:ParameterizedQuery query = `SELECT id, title, description, location, event_date, creator_name, created_at FROM initiatives ORDER BY created_at DESC`;
        stream<Initiative, sql:Error?> resultStream = dbClient->query(query);
        Initiative[]|sql:Error initiatives = from var row in resultStream select row;
        if initiatives is sql:Error {
            log:printError("Database query failed", 'error = initiatives);
            return {body: "Database error occurred"};
        }
        return initiatives;
    }

    // POST /initiatives
// POST /initiatives
// POST /initiatives
resource function post initiatives(@http:Payload json payload) returns Initiative|http:InternalServerError|error {

    // Manually create the Initiative record from the raw json payload.
    Initiative newInitiative = {
        id: (),
        title: check payload.title.ensureType(),
        description: check payload.description.ensureType(),
        location: check payload?.location.ensureType(),
        creator_name: check payload.creator_name.ensureType(),
        event_date: check payload?.event_date.ensureType(),
        created_at: ()
    };

        // The SQL query converts incoming ISO-8601 strings like
        // '2025-08-23T09:00:00Z' or '2025-08-23T09:00:00.123Z' into MySQL DATETIME
        // using STR_TO_DATE + SUBSTRING_INDEX + REPLACE. This avoids Ballerina-side
        // formatting and works with the existing param binding.
        sql:ParameterizedQuery query = `INSERT INTO initiatives (title, description, location, event_date, creator_name) 
                                                                         VALUES (
                                                                             ${newInitiative.title},
                                                                             ${newInitiative.description},
                                                                             ${newInitiative.location},
                                                                             STR_TO_DATE(
                                                                                 SUBSTRING_INDEX(
                                                                                     REPLACE(REPLACE(${newInitiative.event_date}, 'T', ' '), 'Z', ''),
                                                                                     '.',
                                                                                     1
                                                                                 ),
                                                                                 '%Y-%m-%d %H:%i:%s'
                                                                             ),
                                                                             ${newInitiative.creator_name}
                                                                         )`;

    sql:ExecutionResult|sql:Error result = dbClient->execute(query);

    if result is sql:Error {
        log:printError("Database insert failed", 'error = result);
        return {body: "Database error occurred"};
    }

    int|string newId = result.lastInsertId ?: -1;

    Initiative createdInitiative = {
        id: <int>newId,
        title: newInitiative.title,
        description: newInitiative.description,
        location: newInitiative.location,
        event_date: newInitiative.event_date,
        creator_name: newInitiative.creator_name,
        created_at: ""
    };

    return createdInitiative;
}
}