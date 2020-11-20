# CCCS 425 Project 1
## General Information
- Class: CCCS 425 - Web Services
- Term: Fall 2020
- Instructor: Jaques Le Normand
- Email: jacques.lenormand@mcgill.ca
- Project Weight: 40%

Instructions [here](https://wakata.io/webservertestcases/index.html?stream=webservices-chat)

## 
- Heroku: https://cccs425-project1.herokuapp.com
- Glitch: https://onyx-frequent-holiday.glitch.me

# API Endpoints
## /signup
| Response | Request |
| --- | --- |
| {"success":true} | `curl -X POST -d '{"username": "stringer", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |
|{"success":false,"reason":"password field missing"} | `curl -X POST -d '{"username": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |
| {"success":false,"reason":"username field missing"} | `curl -X POST -d '{"password": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |
| {"success":false,"reason":"Username exists"} | `curl -X POST -d '{"username": "stringer_bell", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/signup` |

## /login
| Response | Request |
| --- | --- |
| {"success":true,"token":"some-unique-token-23l4"} | `curl -X POST -d '{"username": "stringer_bell", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/login`|
| {"success":false,"reason":"User does not exist"} | `curl -X POST -d '{"username": "stringer_bel", "password": "queen"}' https://onyx-frequent-holiday.glitch.me/login` |
| {"success":false,"reason":"Invalid password"} | `curl -X POST -d '{"username": "stringer_bell", "password": "quen"}' https://onyx-frequent-holiday.glitch.me/login` |
| {"success":false,"reason":"password field missing"} | `curl -X POST -d '{ "username": "queen"}' https://onyx-frequent-holiday.glitch.me/login`|
| {"success":false,"reason":"username field missing"} | `curl -X POST -d '{ "password": "queen"}' https://onyx-frequent-holiday.glitch.me/login` |
