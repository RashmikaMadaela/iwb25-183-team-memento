// Represents a user of the application (either a volunteer or an organization)
public type User record {|
    int? id;
    string name;
    string email;
    byte[]? password; // Stored as a secure hash (VARBINARY)
    string role;
    string? created_at;
|};

// Represents a single participant who has joined an initiative.
// This is primarily used for the API response.
public type Participant record {|
    string participant_name;
|};

// Represents a volunteering opportunity created by an organization.
public type Initiative record {|
    int? id;
    int? organization_id;
    string title;
    string description;
    string? location;
    string? event_date;
    string? created_at;
    // These two fields are populated by our service logic for API responses
    string? creator_name; 
    Participant[]? participants;
|};