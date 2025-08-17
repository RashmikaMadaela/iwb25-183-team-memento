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
    string creator_name;
    string? created_at;
    Participant[]? participants; // <-- ADD THIS NEW FIELD
|};