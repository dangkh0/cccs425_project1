const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.raw({ type: "*/*" }));
app.use(cors());
app.use(morgan('combined'));

let channelTable = new Map(); // channelId: { channelID, token, channelName}
let tokenTable = new Map(); // token: userId 
let userTable = new Map(); // userId: {username,password:}


// TEST DATA vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
userTable.set("xyz", {username: "stringer_bell", password: "queen"});
userTable.set("zyx", {username: "mcnulty", password: "iLoveAlcohol"});
userTable.set("213", {username: "bodie", password: "money"})

tokenTable.set("this_is_the_token", {userId: "zyx"});
tokenTable.set("this_is_the_token_2", {userId: "xyz"});
tokenTable.set("this_is_the_token_3", {userId: "213"});


channelTable.set("channel-id", {token: "this_is_the_token", channelName: "thewire", memberList: ["zyx"], banList: ["xyz"]});
channelTable.set("channel-id_2", {token: "this_is_the_token_2", channelName: "thebooth", memberList: ["xyz"], banList: ["zyx"]});
// TEST DATA ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// generate random id


// responses ===================================================================
const CREATE_CHANNEL_RES = {
    good: {"success":true},
    notUniqueChannel: {"success":false,"reason":"Channel already exists"},
    missingChannelNameField : {"success":false,"reason":"channelName field missing"},
}

const GLOBAL_RES = {
    invalidToken: {"success":false,"reason":"Invalid token"},
    missingTokenField: {"success":false,"reason":"token field missing"},
}

const JOIN_CHANNEL_RES = {
    good: {"success":true},
    missingPasswordField: {"success":false,"reason":"Invalid token"},
    missingChannelNameField: {"success":false,"reason":"channelName field missing"},
    channelNotExist: {"success":false,"reason":"Channel does not exist"},
    alreadyJoined: {"success":false,"reason":"User has already joined"},
    banned: {"success":false,"reason":"User is banned"},
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

// [C]reate channel request function
let createChannel = (token, reqJSON) => {
    let channelName = reqJSON["channelName"]
    let resValidation = createChannelValidation(token, channelName);
    if (resValidation["success"] === true) {
        let value = {
            token: token, 
            channelName: channelName,
            memberList: [],
            banList: [],
        }
        channelTable.set(genId(), value);
        console.log("new channel: ", channelName);
    };
    console.log("/create-channel response: ", resValidation);
    return resValidation
};

// [G]et map element by value
let getMapKeyByValue = (map, value, valueKey = undefined) => {
    for (let [k, v] of map) {
        if (JSON.stringify(v) === JSON.stringify(value)) { 
            return k;
        } else if (JSON.stringify(v[valueKey]) === JSON.stringify(value)) {
            return k;
        };
    };
    return undefined;
};

// [G]enerate random id
let genId = () => {
    return "" + Math.floor(Math.random() * 1000000000);
};

// [J]oin channel] request function
let joinChannel = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let resValidation = joinChannelValidation(token, channelName);

    if (resValidation["success"]) {
        let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
        let userId = tokenTable.get(token)["userId"];

        console.log("MEMBER LIST: ", channelTable.get(channelId)["memberList"]);
        channelTable.get(channelId)["memberList"].push(userId);
        console.log("welcome to the channel: ", channelTable);
    };
    console.log("/join-channel response: ", resValidation );
    return resValidation
}

// [L]ogin request function
let login = (cred) => {
    let resValidation = loginValidation(cred);
    console.log("login-attempt: ", cred)
    if (resValidation["success"] === true) {
        console.log("welcome back: ", cred["username"]);
    };
    console.log("login: ", resValidation);
    return resValidation
};

// [S]ign up request function
let signUp = (entry) => {
    let userId = genId();
    let resValidation = signUpValidation(entry);
    if (resValidation["success"] === true) {
        userTable.set(userId, entry);
        console.log("newUser: ", userId + ": " + entry);
    };
    return resValidation;
};


// validation functions --------------------------------------------------------

// [C]reate-channel endpoint validation function
let createChannelValidation = (token, channelName) => {
    // validate if token is missing
    if (token === undefined) {
        return GLOBAL_RES["missingTokenField"];
    };
    // validate if channel name field is missing
    if (channelName === undefined) {
        return CREATE_CHANNEL_RES["missingChannelNameField"];
    };
    // validate if token is valid
    if (tokenValidation(token)) {
    // validate if channel name is unique
        if (getMapKeyByValue(channelTable, channelName, "channelName") !== undefined) {
            return CREATE_CHANNEL_RES["notUniqueChannel"]
        };
        return CREATE_CHANNEL_RES["good"]
    }else {
        return GLOBAL_RES["invalidToken"]
    };
};

// [J]oin-channel endpoint validation function
let joinChannelValidation = (token, channelName) => {
    // validate if token is missing
    if (token === undefined) {
        return GLOBAL_RES["missingTokenField"];
    };
    // validate if channel name field is missing
    if (channelName === undefined) {
        return JOIN_CHANNEL_RES["missingChannelNameField"];
    };
    // validate if token is valid
    if(tokenValidation(token)) {
        let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
        let userId = tokenTable.get(token)["userId"];

        // validate if channel exist
        if (getMapKeyByValue(channelTable, channelName, "channelName") === undefined) {
            return JOIN_CHANNEL_RES["channelNotExist"];
        };
        let memberList = channelTable.get(channelId)["memberList"]
        // validate if user is already in channel
        for (let i = 0; i < memberList.length; i++) {
            let memberId = memberList[i];
            console.log("memberId: ", memberId)
            console.log("userId: ", userId)
            if  (userId === memberId) {
                return JOIN_CHANNEL_RES["alreadyJoined"];
            };
        } ;

        let banList = channelTable.get(channelId)["banList"]
        // validate if user is banned from a channel
        for (let i = 0; i < banList.length; i++) {
            let memberId = banList[i];
            if  (userId === memberId) {
                return JOIN_CHANNEL_RES["banned"];
            };
        };
        
        return CREATE_CHANNEL_RES["good"];
    } else {
        return GLOBAL_RES["invalidToken"];
    };

};

// [L]ogin endpoint validation function
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
                tokenTable.set(token, {userId: id});
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

// [S]ignup endpoint validation function
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
    if (getMapKeyByValue(userTable, entry["username"], "username") !== undefined) {
        return SIGNUP_RES['notUnique'];
    };

    console.log("userTable: ", userTable);
    console.log("entry: ", entry); 
    return SIGNUP_RES['good'];
}

// [T]oken validation function
let tokenValidation = token => {
    return tokenTable.get(token) !== undefined
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
    let reqJSON = undefined;

    console.log("/create-channel: ", body);

    reqJSON = {channelName: body.channelName};
    debugger
    res.send(createChannel(token, reqJSON));
});

app.post("/join-channel", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/join-channel: ", body);

    reqJSON = {channelName: body.channelName};
    debugger
    res.send(joinChannel(token, reqJSON));
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
