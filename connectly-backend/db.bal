import ballerinax/mysql;

// 1. We define our own record to perfectly match the keys in Config.toml.
type DbConfig record {|
    string host;
    string user;
    string password;
    string database;
    int port;
|};

// 2. We create a 'configurable' variable of our custom type.
//    Ballerina will fill this from the root of Config.toml.
configurable DbConfig dbOptions = ?;

// 3. We initialize the client by passing each value from our variable.
//    This is the most direct and explicit method.
public final mysql:Client dbClient = check new mysql:Client(
    host = dbOptions.host,
    user = dbOptions.user,
    password = dbOptions.password,
    database = dbOptions.database,
    port = dbOptions.port
);