const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.raw({ type: "*/*" }));
app.use(cors());
app.use(morgan('combined'));

let channelTable = new Map(); // channelId: {token, channelName}
let loginTable = new Map(); // token: userId 
let userTable = new Map(); // userId: {username,password:}


// TEST DATA vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
userTable.set("xyz", {username: "stringer_bell", password: "queen"});
userTable.set("zyx", {username: "mcnulty", password: "iLoveAlcohol"});

loginTable.set("this_is_the_token", {userId: "zyx"});

channelTable.set("channel-id", {token: "this_is_the_token", channelName: "thewire"});
// TEST DATA ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// generate random id
let genId = () => {
    return "" + Math.floor(Math.random() * 1000000000);
};

// responses ===================================================================

const GLOBAL_RES = {
    invalidToken: {"success":false,"reason":"Invalid token"},
    missingTokenField: {"success":false,"reason":"token field missing"},
}

const CREATE_CHANNEL_RES = {
    good: {"success":true},
    notUniqueChannel: {"success":false,"reason":"Channel already exists"},
    missingChannelNameField : {"success":false,"reason":"channelName field missing"},
}

const SIGNUP_RES = {
    good: {"success":true},
    notUnique: {"success":false,"reason":"Username exists"},
    missingNameField: {"success":false,"reason":"username field missing"},
    missingPasswordField: {"success":false,"reason":"password field missing"},
};

const LOGIN_RES = {
    good: {"success":true,"token": undefined},
    invalidPassword: {"success":false,"reason":"Invalid password"},
    missingNameField: {"success":false,"reason":"username field missing"},
    missingPasswordField: {"success":false,"reason":"password field missing"},
    userNotExist: {"success":false,"reason":"User does not exist"},
};

// functions and methods =======================================================

// search map by value
let findValueInMap = (map, value, valueKey = undefined) => {
    for (let [k, v] of map) {
        // if (valueKey === undefined) {
            if (JSON.stringify(v) === JSON.stringify(value)) { 
                return true;
            } else if (JSON.stringify(v[valueKey]) === JSON.stringify(value)) {
                return true;
            };
        // } else {
        //     if (JSON.stringify(v[valueKey]) === JSON.stringify(value)) { 
        //         return true;
        //     };
        // };
    };
    return false;
};

// function where there is a create channel name request
let createChannel = (token, newChannel) => {
    let channelName = newChannel["channelName"]
    let validationResponse = createChannelName(token, channelName);
    if (validationResponse["success"] === true) {
        channelTable.set(genId(), {token: token, channelName:channelName});
        console.log("channel TABLE: ", channelTable);
        console.log("createChannel: ", validationResponse);
        console.log("new channel: ", channelName);
    };
    return validationResponse
};

// function when there is a login request
let login = (cred) => {
    let validationResponse = loginValidation(cred);
    console.log("login-attempt: ", cred)
    if (validationResponse["success"] === true) {
        console.log("login: ", validationResponse);
    };
    return validationResponse
};

// function when there is a signup request
let signUp = (entry) => {
    let userId = genId();
    let validationResponse = signUpValidation(entry);
    if (validationResponse["success"] === true) {
        userTable.set(userId, entry);
        console.log("newUser: ", userId + ": " + entry);
    };
    return validationResponse;
};


// validation functions --------------------------------------------------------

// validation for /create-channel endpoint
let createChannelName = (token, channelName) => {
    // validate if token is missing
    if (token === undefined) {
        return GLOBAL_RES["missingTokenField"];
    };
    // validate if channel name field is missing
    if (channelName === undefined) {
        return CREATE_CHANNEL_RES["missingChannelNameField"];
    };
    // validate if token is valid
    if (loginTable.get(token) !== undefined) {
        // validate if channel name is unique
        if (findValueInMap(channelTable, channelName, "channelName")) {
            return CREATE_CHANNEL_RES["notUniqueChannel"]
        };
    } else {
        return GLOBAL_RES["invalidToken"]
    };
    return CREATE_CHANNEL_RES["good"]
};

// validation for /login endpoint
let loginValidation = cred => {
    let userIds = Array.from(userTable.keys());

    // valiadate if username field is missing
    if (cred['username'] === undefined) {
        return LOGIN_RES['missingNameField'];
    }
    // valiadate if password field is missing
    if (cred['password'] === undefined) {
        return LOGIN_RES['missingPasswordField'];
    }
    // valildate if username exist in userDataBase
    for (let i = 0; i < userIds.length; i++) {
        let id = userIds[i];
        let password = userTable.get(id)["password"];
        let username = userTable.get(id)["username"];
        
        if (cred['username'] === username) {
            if (cred['password'] === password) {
                let token  = genId();
                loginTable.set(token, {userId: id});
                LOGIN_RES['good']['token'] = token;
                console.log("Login Response: ", LOGIN_RES["good"]);
                return LOGIN_RES['good'];
            } else {
                return LOGIN_RES['invalidPassword'];
            };
        };
    };
    return LOGIN_RES['userNotExist'];
};

// validation for /signup endpoint
let signUpValidation = entry => {
    // valiadate if username field is missing
    if (entry["username"] === undefined) {
        return SIGNUP_RES['missingNameField'];
    }
    // valiadate if password field is missing
    if (entry["password"] === undefined) {
        return SIGNUP_RES['missingPasswordField'];
    }
    // validate unique entry
    if (!findValueInMap(userTable, entry["username"], "username")) {
        console.log("userTable: ", userTable);
        console.log("entry: ", entry); 
        return SIGNUP_RES['good'];
    } else {
        return SIGNUP_RES['notUnique'];
    };
}

// api stuff====================================================================

// GET -------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get("/sourcecode", (req, res) => {
    res.send(require('fs').readFileSync(__filename).toString())
  });

// POST ------------------------------------------------------------------------
app.post("/create-channel", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let newChannel = undefined;

    console.log("/create-channel", body);

    newChannel = {channelName: body.channelName};
    debugger
    res.send(createChannel(token, newChannel));
});

app.post("/login", (req, res) => {
    let cred  = undefined;
    let body = JSON.parse(req.body);

    console.log("/login: ", body);

    cred = {username: body.username, password: body.password};
    
    res.send(login(cred));
});

app.post("/signup", (req, res) => {
    let entry = undefined
    let body = JSON.parse(req.body);

    console.log('/signup: ', body);

    entry = {username: body.username, password: body.password};

    res.send(signUp(entry));
});

// other -----------------------------------------------------------------------

//TODO: i dont know what this does
app.listen(process.env.PORT || 3000)
