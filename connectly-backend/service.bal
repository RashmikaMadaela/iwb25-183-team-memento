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
resource function get initiatives() returns Initiative[]|http:InternalServerError|error {
    sql:ParameterizedQuery query = `SELECT id, title, description, location, event_date, creator_name, created_at FROM initiatives ORDER BY created_at DESC`;

    stream<Initiative, sql:Error?> resultStream = dbClient->query(query);
    Initiative[]|sql:Error initiativesResult = from var row in resultStream select row;

    if initiativesResult is sql:Error {
        log:printError("Database query failed", 'error = initiativesResult);
        return {body: "Database error occurred"};
    }

    // --- START NEW LOGIC ---
    // For each initiative, fetch its participants and attach them.
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
    // --- END NEW LOGIC ---

    return initiativesResult;
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
        created_at: (),
        participants: () // <-- ADD THIS LINE
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
        created_at: "",
        participants: []
    };

    return createdInitiative;
}

// POST /participants
// Creates a new participant record, linking a user to an initiative.
resource function post participants(@http:Payload json payload) returns http:Created|http:InternalServerError|error {

    // 1. Extract both the initiative ID and name from the JSON body.
    int initiativeId = check payload.initiative_id.ensureType();
    string participantName = check payload.participant_name.ensureType();

    // 2. Define the SQL query to insert a new participant.
    sql:ParameterizedQuery query = `INSERT INTO participants (initiative_id, participant_name) VALUES (${initiativeId}, ${participantName})`;

    // 3. Execute the query.
    sql:ExecutionResult|sql:Error result = dbClient->execute(query);

    if result is sql:Error {
        log:printError("Failed to add participant", 'error = result);
        return <http:InternalServerError>{body: "Database error occurred"};
    }

    // 4. On success, return a 201 Created status.
    return http:CREATED;
}

}