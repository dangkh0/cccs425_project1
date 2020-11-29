const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const { get } = require('http');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.raw({ type: "*/*" }));
app.use(cors());
app.use(morgan('combined'));

let channelTable = new Map(); // channelId: { channelID, token, channelName}
let tokenTable = new Map(); // token: {userId}
let userTable = new Map(); // userId: {username,password}

// TEST DATA vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
userTable.set("xyz", {username: "stringer_bell", password: "queen"});
userTable.set("zyx", {username: "mcnulty", password: "iLoveAlcohol"});
userTable.set("213", {username: "bodie", password: "money"})

tokenTable.set("this_is_the_token", {userId: "zyx"});
tokenTable.set("this_is_the_token_2", {userId: "xyz"});
tokenTable.set("this_is_the_token_3", {userId: "213"});


channelTable.set("channel-id", {token: "this_is_the_token", channelName: "thewire", memberList: ["zyx"], banList: ["xyz"], messages: []});
channelTable.set("channel-id_2", {token: "this_is_the_token_2", channelName: "thebooth", memberList: ["xyz"], banList: ["zyx"], messages: []});
// TEST DATA ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

// responses ===================================================================
const CREATE_CHANNEL_RES = {
    good: {"success":true},
    notUniqueChannel: {"success":false,"reason":"Channel already exists"},
    missingChannelNameField : {"success":false,"reason":"channelName field missing"},
}

const DELETE_RES = {
    good: {"success": true},
    channelNotExist: {"success":false,"reason":"Channel does not exist"},
    missingChannelNameField: {"success":false,"reason":"channelName field missing"},
    notOwner: {"success":false,"reason":"Channel not owned by user"},
}

const GLOBAL_RES = {
    invalidToken: {"success":false,"reason":"Invalid token"},
    missingTokenField: {"success":false,"reason":"token field missing"},
}

const JOIN_CHANNEL_RES = {
    good: {"success":true},
    missingChannelNameField: {"success":false,"reason":"channelName field missing"},
    channelNotExist: {"success":false,"reason":"Channel does not exist"},
    existingMember: {"success":false,"reason":"User has already joined"},
    banned: {"success":false,"reason":"User is banned"},
}

const JOINED_RES = {
    good: {"success":true,"joined":undefined},
    channelNotExist: {"success":false,"reason":"Channel does not exist"},
    notMember: {"success":false,"reason":"User is not part of this channel"},
};

const KICK_RES = {
    good: {"success":true},
    missingChannelNameField: {"success":false,"reason":"channelName field missing"},
    missingTargetField: {"success":false,"reason":"target field missing"},
    notOwner: {"success":false,"reason":"Channel not owned by user"},
};

const LEAVE_CHANNEL_RES = {
    good: {"success": true},
    missingChannelNameField: {"success":false,"reason":"channelName field missing"},
    channelNotExist: {"success":false,"reason":"Channel does not exist"},
    notMember: {"success":false,"reason":"User is not part of this channel"},
};

const LOGIN_RES = {
    good: {"success":true,"token": undefined},
    invalidPassword: {"success":false,"reason":"Invalid password"},
    missingNameField: {"success":false,"reason":"username field missing"},
    missingPasswordField: {"success":false,"reason":"password field missing"},
    userNotExist: {"success":false,"reason":"User does not exist"},
};

const MESSAGE_RES = {
    good: {"success": true},
    channelNotExist: {"success": false, "reason": "channel does not exist"},
    missingChannelNameField: {"success":false,"reason":"channelName field missing"},
    missingContentsField: {"success":false,"reason":"channelName field missing"},
    notMember: {"success":false,"reason":"User is not part of this channel"},
};

const SIGNUP_RES = {
    good: {"success":true},
    notUnique: {"success":false,"reason":"Username exists"},
    missingNameField: {"success":false,"reason":"username field missing"},
    missingPasswordField: {"success":false,"reason":"password field missing"},
};

// functions and methods =======================================================

// [B]an channel request handler function
let ban = (token, reqJSON) => {

};

// [C]reate channel request handler function
let createChannel = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let resValidation = createChannelValidation(token, channelName);
    if (resValidation["success"] === true) {
        let value = {
            token: token, 
            channelName: channelName,
            memberList: [],
            banList: [],
            messages: [],
        }
        channelTable.set(genId(), value);
        console.log("new channel: ", channelName);
    };
    console.log("/create-channel response: ", resValidation);
    return resValidation
};

// [D]elete Channel request handler function
let deleteChannel = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let resValidation = deleteChannelValidation(token, channelName);
    
    if (resValidation["success"]) {
        //delete channel
        let channelId = getMapKeyByValue(channelTable, channelName, "channelName");
        channelTable.delete(channelId);
        console.log("You deleted: ", channelName);
    };
    console.log("/delete response: ", resValidation);
    return resValidation;
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

// [J]oin channel request handler function
let joinChannel = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let resValidation = joinChannelValidation(token, channelName);

    if (resValidation["success"]) {
        let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
        let userId = tokenTable.get(token)["userId"];

        channelTable.get(channelId)["memberList"].push(userId);
        console.log("welcome to the channel: ", userId);
    };
    console.log("/join-channel response: ", resValidation );
    return resValidation
};

// [J]oined request handler function
let joined = (token, channelName) => {
    let channelId = getMapKeyByValue (channelTable, channelName, "channelName");
    let resValidation = joinedValidation(token, channelName);

    console.log("/joined response: ", resValidation );
    return resValidation;
};

let kick = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let target = reqJSON["target"];
    let resValidation = kickValidation(token, reqJSON);

    if (resValidation["success"]) {
        let channelId = getMapKeyByValue(channelTable, channelName, "channelName");
        let memberList = channelTable.get(channelId)["memberList"];
        console.log("MEMBER LIST: ", memberList);
        
        for (let i = 0; i < memberList.length; i++) {
            let memberId = memberList[i];
            console.log("memberId: ", memberId);
            console.log("target: ", target);
            if (memberId === target) {
                memberList.splice(i, 1);
                console.log("MEMBER LIST: ", memberList );
            };
        };
    };
    console.log("/kick response: ", resValidation);
    return resValidation;
}

// [L]eave cahnnel request handler function
let leaveChannel = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let resValidation = leaveChannelValidation(token, channelName);

    if (resValidation["success"]) {
        let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
        let userId = tokenTable.get(token)["userId"];

        let memberList = channelTable.get(channelId)["memberList"]

        for (let i = 0; i < memberList.length; i++) {
            let memberId = memberList[i];
            console.log("memberId: ", memberId);
            console.log("userId: ", userId);
            if (memberId === userId) {
                memberList.splice(i, 1);
            };
        };
    };
    console.log("/leave-channel response: ", resValidation );
    return resValidation
};

// [Message] request handler function
let message = (token, reqJSON) => {
    let contents = reqJSON["contents"];
    let channelName = reqJSON["channelName"];
    let resValidation = messageValidation(token, reqJSON);

    if (resValidation["success"]) {
        let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
        let userId = tokenTable.get(token)["userId"];
        let message = {
            from: userTable.get(userId)["username"],
            contents: contents,
        };
        channelTable.get(channelId)["messages"].push(message);
        console.log("message: ", message)
    };
    console.log("/message: response", resValidation);
    return resValidation;
}

// [Message]s request handler function
let messages = (token, reqJSON) => {

};

// [L]ogin request handler function
let login = (cred) => {
    let resValidation = loginValidation(cred);
    console.log("login-attempt: ", cred)
    if (resValidation["success"] === true) {
        console.log("welcome back: ", cred["username"]);
    };
    console.log("/login response: ", resValidation);
    return resValidation
};

let memberNameList = (memberList)=> {
    let memberNameList = [];
    for (let i = 0; i < memberList.length; i++) {
        memberId = memberList[i];
        memberName = userTable.get(memberId)["username"];
        memberNameList.push(memberName);
    };
    return memberNameList;
};

// [S]ign up request handler function
let signUp = (entry) => {
    let userId = genId();
    let resValidation = signUpValidation(entry);
    if (resValidation["success"] === true) {
        userTable.set(userId, entry);
        console.log("newUser: ", userId + ": " + entry);
    };
    console.log("/signUp response: ", resValidation);
    return resValidation;
};


// validation functions --------------------------------------------------------

// [C]reate-channel endpoint validation function
let createChannelValidation = (token, channelName) => {
    // validate token requirements
    if (tokenValidations(token) !== undefined) {
        return tokenValidations(token);
    };
    // validate if channel name field is missing
    if (channelName === undefined) {
        return CREATE_CHANNEL_RES["missingChannelNameField"];
    };
    // validate if channel name is unique
    if (getMapKeyByValue(channelTable, channelName, "channelName") !== undefined) {
        return CREATE_CHANNEL_RES["notUniqueChannel"];
    };
    return CREATE_CHANNEL_RES["good"];
};

// [D]elete endpoint validation function
let deleteChannelValidation = (token, channelName) => {
    // validate token requirements
    console.log("TOKENTABLE: ", tokenTable);
    if (tokenValidations(token) !== undefined) {
        return tokenValidations(token);
    };
    
    // validate if channel name field is missing
    if (channelName === undefined) {
        return DELETE_RES["missingChannelNameField"];
    };
    
    let channelId = getMapKeyByValue(channelTable, channelName, "channelName");
    
    // validate if channel does not exist
    if (channelId === undefined) {
        return DELETE_RES["channelNotExist"];
    };
    
    // validate if is not channel owner
    if (channelTable.get(channelId)["token"] !== token) {
        return DELETE_RES["notOwner"];
    }
    
    return DELETE_RES["good"];
};  

// [Join]-channel endpoint validation function
let joinChannelValidation = (token, channelName) => {
    // validate token requirements
    if (tokenValidations(token) !== undefined) {
        return tokenValidations(token);
    };
    // validate if channel name field is missing
    if (channelName === undefined) {
        return JOIN_CHANNEL_RES["missingChannelNameField"];
    };

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
        if  (userId === memberId) {
            return JOIN_CHANNEL_RES["existingMember"];
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
    
    return JOIN_CHANNEL_RES["good"];
};

// [Join]ed endpoint validation function
let joinedValidation = (token, channelName) => {
    let channelId = getMapKeyByValue(channelTable, channelName, "channelName");

    console.log("Channel ID: ", channelTable.get(channelId));

    if (tokenValidations(token) !== undefined) {
        return tokenValidations(token)
    }

    let userId = tokenTable.get(token)["userId"];
    console.log("User ID: ", userId);
    // validate if channel exist
    if (channelId === undefined) {
        return JOINED_RES["channelNotExist"];
    };
    // validate if user is in channel
    let memberList = channelTable.get(channelId)["memberList"]
    for (let i = 0; i < memberList.length; i++) {
        let memberId = memberList[i];
        if  (userId === memberId) {
            let memberNameLst = memberNameList(memberList);
            JOINED_RES["good"]["joined"] = memberNameLst;
            return JOINED_RES["good"];
        };
    };
    return JOINED_RES["notMember"];
};

// [K]ick endpoint validation function
let kickValidation = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let target = reqJSON["target"];

    // validate if token is valid
    if ( tokenValidations(token) !== undefined) {
        return tokenValidations(token);
    };

    // validate if channelName is missing
    if ( channelName === undefined) {
        return KICK_RES["missingChannelNameField"];
    };

    let channelId = getMapKeyByValue(channelTable, channelName, "channelName");
    
    // validate if target is missing
    if ( target === undefined) {
        return KICK_RES["missingTargetField"];
    };

    // validate if requester is channel owner
    if (channelTable.get(channelId)["token"] !== token) {
        return KICK_RES["notOwner"];
    };

    return KICK_RES["good"];
};

// [L]eave-channel endpoint validation function
let leaveChannelValidation = (token, channelName) => {
    // validate token requirements
    if (tokenValidations(token) !== undefined) {
        return tokenValidations(token);
    };
    // validate if channel name field is missing
    if (channelName === undefined) {
        return LEAVE_CHANNEL_RES["missingChannelNameField"];
    };

    let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
    let userId = tokenTable.get(token)["userId"];

    // validate if channel exist
    if (getMapKeyByValue(channelTable, channelName, "channelName") === undefined) {
        return LEAVE_CHANNEL_RES["channelNotExist"];
    };
    let memberList = channelTable.get(channelId)["memberList"];
    // validate if user is in channel
    for (let i = 0; i < memberList.length; i++) {
        let memberId = memberList[i];
        if  (userId === memberId) {
            return LEAVE_CHANNEL_RES["good"];
        };
    };
    return LEAVE_CHANNEL_RES["notMember"];
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
                return LOGIN_RES['good'];
            } else {
                return LOGIN_RES['invalidPassword'];
            };
        };
    };
    return LOGIN_RES['userNotExist'];
};

// [M]essage endpoint validation function
let messageValidation = (token, reqJSON) => {
    let channelName = reqJSON["channelName"];
    let contents = reqJSON["contents"];

    // validate if token requirements
    if (tokenValidations(token) !== undefined) {
        return tokenValidations(token);
    };

    // validate if channelName field is missing
    if (channelName === undefined) {
        return MESSAGE_RES["missingChannelNameField"];
    };
    
    let channelId =  getMapKeyByValue(channelTable, channelName, "channelName");
    let userId = tokenTable.get(token)["userId"];

    // validate if channel exist
    if (channelId === undefined) {
        return MESSAGE_RES["channelNotExist"];
    };

    // validate if content field is missing
    if (contents === undefined) {
        return MESSAGE_RES["missingContentsField"];
    };
    
    let memberList = channelTable.get(channelId)["memberList"];
    // validate if user is part of channel
    for (let i = 0; i < memberList.length; i++) {
        let memberId = memberList[i];
        if  (userId === memberId) {
            return MESSAGE_RES["good"];
        };
    };
    return MESSAGE_RES["notMember"];
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

    return SIGNUP_RES['good'];
};

// [T]oken validation function
let tokenValidations = token => {
    if (token === undefined) {
        return GLOBAL_RES["missingTokenField"];
    };

    if (tokenTable.get(token) === undefined) {
        return GLOBAL_RES["invalidToken"]
    };

    return undefined;
};

// api stuff====================================================================

// GET -------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/joined', (req, res) => {
    let channelName = req.query.channelName;
    let token = req.headers["token"];

    console.log("/joined: ", channelName);
    res.send(joined(token, channelName));
})

// app.get("/messages", (req, res) => {
//     let channelName = req.query.channelName;
//     let token = req.headers["token"];
    
//     console.log("/messages: ", channelName);
//     res.send(messages(token, channelName));
// });

app.get("/sourcecode", (req, res) => {
    res.send(require('fs').readFileSync(__filename).toString())
});

// POST ------------------------------------------------------------------------
// app.post("/ban", (req, res) => {
//     let body = JSON.parse(req.body);
//     let token = req.headers["token"];
//     let reqJSON = undefined;

//     console.log("/ban: ", body);

//     reqJSON = {channelName: body.channelName, target: body.target}

//     res.send(ban(token, reqJSON));
// });

app.post("/create-channel", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/create-channel: ", body);

    reqJSON = {channelName: body.channelName};

    res.send(createChannel(token, reqJSON));
});

app.post("/delete", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/delete: ", body);

    reqJSON = {channelName: body.channelName};

    res.send(deleteChannel(token, reqJSON));
});

app.post("/join-channel", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/join-channel: ", body);

    reqJSON = {channelName: body.channelName};

    res.send(joinChannel(token, reqJSON));
});

app.post("/kick", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/kick: ", body);

    reqJSON = {channelName: body.channelName, target: body.target}

    res.send(kick(token, reqJSON));
});

app.post("/leave-channel", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/leave-channel: ", body);

    reqJSON = {channelName: body.channelName};

    res.send(leaveChannel(token, reqJSON));
})

app.post("/login", (req, res) => {
    let cred  = undefined;
    let body = JSON.parse(req.body);

    console.log("/login: ", body);

    cred = {username: body.username, password: body.password};
    
    res.send(login(cred));
});

app.post("/message", (req, res) => {
    let body = JSON.parse(req.body);
    let token = req.headers["token"];
    let reqJSON = undefined;

    console.log("/message: ", body);

    reqJSON = {channelName: body.channelName, contents: body.contents}

    res.send(message(token, reqJSON));
});

app.post("/signup", (req, res) => {
    let entry = undefined
    let body = JSON.parse(req.body);

    console.log('/signup: ', body);

    entry = {username: body.username, password: body.password};

    res.send(signUp(entry));
});

// others -----------------------------------------------------------------------

//TODO: i dont know what this does
app.listen(process.env.PORT || 3000)
