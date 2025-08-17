// Represents a single participant
public type Participant record {|
    string participant_name;
|};

// Represents an initiative, now including a list of participants
public type Initiative record {|
    int? id;
    string title;
    string description;
    string? location;
    string? event_date;
    string? creator_name; // Kept for the GET response
    string? created_at;
    Participant[]? participants;
    int? organization_id; // <-- ADD THIS FIELD
|};

// Represents a user of the application
public type User record {|
    int? id;
    string name;
    string email;
    byte[]? password; // Correct type to match the database
    string role;
    string? created_at;
|};