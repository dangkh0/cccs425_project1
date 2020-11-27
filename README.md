# cccs 425 project 1
## general onformation
- class: cccs 425 - web Services
- term: fall 2020
- instructor: Jaques Le Normand
- email: jacques.lenormand@mcgill.ca
- project weight: 40%

instructions [here](https://wakata.io/webservertestcases/index.html?stream=webservices-chat)

## 
- heroku: https://cccs425-project1.herokuapp.com
- glitch: https://onyx-frequent-holiday.glitch.me
---
# API endpoints
## /signup
| response | request |
| --- | --- |
| {"success":true} | `curl -X POST -d '{"username": "stringer", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |
|{"success":false,"reason":"password field missing"} | `curl -X POST -d '{"username": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |
| {"success":false,"reason":"username field missing"} | `curl -X POST -d '{"password": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |
| {"success":false,"reason":"Username exists"} | `curl -X POST -d '{"username": "stringer_bell", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |

## /login
| response | request |
| --- | --- |
| {"success":true,"token":"some-unique-token-23l4"} | `curl -X POST -d '{"username": "stringer_bell", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/login`|
| {"success":false,"reason":"User does not exist"} | `curl -X POST -d '{"username": "stringer_bel", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/login` |
| {"success":false,"reason":"Invalid password"} | `curl -X POST -d '{"username": "stringer_bell", "password": "quen"}' https://onyx-frequent-holiday.glitch.me/login` |
| {"success":false,"reason":"password field missing"} | `curl -X POST -d '{ "username": "stringer_bell"}' https://onyx-frequent-holiday.glitch.me/login`|
| {"success":false,"reason":"username field missing"} | `curl -X POST -d '{ "password": "queen"}' https://onyx-frequent-holiday.glitch.me/login` |

## /create-channel
| response | request |
| --- | --- |
| {"success":true} | `curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "orlandos"}' 'https://onyx-frequent-holiday.glitch.me/create-channel'` |
| {"success":false,"reason":"token field missing"} | `curl -XPOST -d '{"channelName": "orlandos"}' 'https://onyx-frequent-holiday.glitch.me/create-channel'` |
| {"success":false,"reason":"Invalid token"} | `curl -XPOST -H 'token: this_is_not_the_token' -d '{"channelName": "orlandos"}' 'https://onyx-frequent-holiday.glitch.me/create-channel'` |
| {"success":false,"reason":"channelName field missing"} | `curl -XPOST -H 'token: this_is_the_token' -d '{}' 'https://onyx-frequent-holiday.glitch.me/create-channel'`|
| {"success":false,"reason":"Channel already exists"} | `curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thewire"}' 'https://onyx-frequent-holiday.glitch.me/create-channel'` |

## /join-channel
| response | request |
| --- | --- |
| {"success":true} |  |
| {"success":false,"reason":"token field missing"} | curl -XPOST -d '{"channelName": "thebooth"}' "https://onyx-frequent-holiday.glitch.me/join-channel" |
| {"success":false,"reason":"Invalid token"} | curl -XPOST -H 'token: this_is_the_token_0' -d '{"channelName": "thebooth"}' "https://onyx-frequent-holiday.glitch.me/join-channel" |
| {"success":false,"reason":"channelName field missing"} | curl -XPOST -H 'token: this_is_the_token_3' -d '{}' "https://onyx-frequent-holiday.glitch.me/join-channel" |
| {"success":false,"reason":"Channel does not exist"}$ | curl -XPOST -H 'token: this_is_the_token_3' -d '{"channelName": "thecell"}' "https://onyx-frequent-holiday.glitch.me/join-channel" |
| {"success":false,"reason":"User has already joined"} | curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thewire"}' "https://onyx-frequent-holiday.glitch.me/join-channel" |
| {"success":false,"reason":"User is banned"} | curl -XPOST -H 'token: this_is_the_token_2' -d '{"channelName": "thewire"}' "https://onyx-frequent-holiday.glitch.me/join-channel" |
---
# maps
## channelTable
| fields | datatype | description |
| --- | --- | ---|
| channelId | integer | PK, unique id |
| token | interger | FK. token of channel creator |
| channelName | varchar | name of the channel |
| memberList | list | list of userIds that are in the channel |
| banList | list | list of of userIds that are banned from the channel |


## tokenTable
| fields | datatype | description |
| --- | --- | ---|
| token | interger | PK, unique id |
| userId | varchar | FK unique id from userTable |


## userTable
| fields | datatype | description |
| --- | --- | ---|
| userId | interger | PK, unique id |
| username | varchar | users name |
| password | varchar | users password |
