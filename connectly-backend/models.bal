// Represents an initiative
public type Initiative record {|
    int? id;
    string title;
    string description;
    string? location;
    string? event_date;
    string creator_name;
    string? created_at;
|};