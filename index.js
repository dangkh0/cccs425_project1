const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.raw({ type: "*/*" }));
app.use(cors());
app.use(morgan('combined'));

let userDataBase = new Map(); //userId: {username:xyz, password:xyz}

userDataBase.set('xyz', {'username': 'stringer_bell', 'password': 'queen'});

// generate random id
let genId = () => {
    return "" + Math.floor(Math.random() * 1000000000);
};

// responses ===================================================================

const SIGNUP_RESPONSES = {
    good: {"success":true},
    notUnique: {"success":false,"reason":"Username exists"},
    missingNameField: {"success":false,"reason":"username field missing"},
    missingPasswordField: {"success":false,"reason":"password field missing"},
};

const LOGIN_REPONSES = {
    good: {"success":true,"token": genId()},
    userNotExist: {"success":false,"reason":"User does not exist"},
    invalidPassword: {"success":false,"reason":"Invalid password"},
    missingNameField: {"success":false,"reason":"username field missing"},
    missingPasswordField: {"success":false,"reason":"password field missing"},
};

// functions and methods========================================================

// search map by value
let findValueInMap = (map, value) => {
    for (let [k, v] of map) {
      if (JSON.stringify(v) === JSON.stringify(value)) { 
        return true; 
      };
    };
    return false;
};

let login = cred => {
    let validationResponse = loginValidation(cred);
    
    console.log("login-attempt: ". cred)
    
    if (validationResponse["success"] === true) {
        console.log("login-response: ", validationResponse);
    };

    return validationResponse
};

// function when there is a signup
let newSignUp = entry => {
    let userId = genId();
    
    let validationResponse = newSignUpValidation(entry)
    if (validationResponse["success"] === true) {
        userDataBase.set(userId, entry);
        console.log("newUser: ", userId + ": " + entry);
    }
    return validationResponse;
};

// validation function ---------------------------------------------------------

let loginValidation = cred => {
    let userIds = Array.from(userDataBase.keys())

    // valiadate if username field is missing
    if (cred['username'] === undefined) {
        return LOGIN_REPONSES['missingNameField'];
    }
    // valiadate if password field is missing
    if (cred['password'] === undefined) {
        return LOGIN_REPONSES['missingPasswordField'];
    }
    // valildate if username exist
    for (let i = 0; i < userIds.length; i++) {
        let id = userIds[i];
        let password = userDataBase.get(id)["password"];
        let username = userDataBase.get(id)["username"];

        if (cred["username"] === username) {
            // validate password if username exist 
            if (cred["password"] === password) {
                return LOGIN_REPONSES['good'];
            } else {
                return LOGIN_REPONSES['invalidPassword']
            };
        } else {
            return LOGIN_REPONSES['userNotExist']
        };
    };
};

let newSignUpValidation = entry => {
    // valiadate if username field is missing
    if (entry['username'] === undefined) {
        return SIGNUP_RESPONSES['missingNameField'];
    }
    // valiadate if password field is missing
    if (entry['password'] === undefined) {
        return SIGNUP_RESPONSES['missingPasswordField'];
    }
    // validate unique entry
    if (!findValueInMap(userDataBase, entry)) {
        return SIGNUP_RESPONSES['good'];
    } else {
        return SIGNUP_RESPONSES['notUnique'];
    };
}

// api stuff====================================================================

// GET -------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post("/signup", (req, res) => {
    let entry = undefined
    let parsed = JSON.parse(req.body);

    console.log('body: ', req.body);
    console.log('body: ', parsed);

    entry = {username: parsed.username, password: parsed.password};

    res.send(newSignUp(entry));
});

app.post("/login", (req, res) => {
    let parsed = JSON.parse(req.body);
    debugger
    console.log("body: ", req.body);
    console.log("body: ", parsed);

    let cred = {username: parsed.username, password: parsed.password};
    
    res.send(login(cred));
});

app.get("/sourcecode", (req, res) => {
  res.send(require('fs').readFileSync(__filename).toString())
});

//TODO: i dont know what this does
app.listen(process.env.PORT || 3000)
