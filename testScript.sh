#!/bin/bash

# URL
glitch_url="https://onyx-frequent-holiday.glitch.me"
heroku_url="https://cccs425-project1.herokuapp.com"

url=$glitch_url

clear="\033[0m"
green="\033[0;32m"
red="\033[0;31m"

# # /signup -----------------------------------------------------------------------
# echo -e "\n$red/signup$clear"
# echo -e "${green}{\"success\":true}${clear}"
# curl -X POST -d '{"username": "stringer", "password": "queen"}' "$url/signup"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"password field missing\"}${clear}"
# curl -X POST -d '{"username": "queen"}' "$url/signup"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"username field missing\"}${clear}"
# curl -X POST -d '{"password": "queen"}' "$url/signup"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"Username exists\"}${clear}"
# curl -X POST -d '{"username": "stringer_bell", "password": "queen"}' "$url/signup"

# # /login -----------------------------------------------------------------------
# echo -e "\n\n$red/login$clear"
# echo -e "${green}{\"success\":true,\"token\":\"#########\"}${clear}"
# curl -X POST -d '{"username": "stringer_bell", "password": "queen"}' "$url/login"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"username field missing\"}${clear}"
# curl -X POST -d '{ "password": "queen"}' "$url/login"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"password field missing\"}${clear}"
# curl -X POST -d '{ "username": "stringer_bell"}' "$url/login"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"User does not exist\"}${clear}"
# curl -X POST -d '{"username": "stringer_bel", "password": "queen"}' "$url/login"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"Invalid password\"}${clear}"
# curl -X POST -d '{"username": "stringer_bell", "password": "quen"}' "$url/login"

# # /create-channnel -------------------------------------------------------------
# echo -e "\n\n$red/create-channel$clear"
# echo -e "${green}{\"success\":true}${clear}"
# curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "orlandos"}' "$url/create-channel"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"Invalid token\"}${clear}"
# curl -XPOST -H 'token: this_is_not_the_token' -d '{"channelName": "orlandos"}' "$url/create-channel"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"token field missing\"}${clear}"
# curl -XPOST -d '{"channelName": "orlandos"}' "$url/create-channel"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"channelName field missing\"}${clear}"
# curl -XPOST -H 'token: this_is_the_token' -d '{}' "$url/create-channel"

# echo -e "\n\n${green}{\"success\":false,\"reason\":\"Channel already exists\"}${clear}"
# curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thewire"}' "$url/create-channel"

# # /join-channnel ---------------------------------------------------------------
# echo -e "\n\n$red/join-channel$clear"
# echo -e "$green{\"success\":true}$clear"
# curl -XPOST -H 'token: this_is_the_token_3' -d '{"channelName": "thebooth"}' "$url/join-channel"

# echo -e "\n\n$green{\"success\":false,\"reason\":\"token field missing\"}$clear"
# curl -XPOST -d '{"channelName": "thebooth"}' "$url/join-channel"

# echo -e "\n\n$green{\"success\":false,\"reason\":\"Invalid token\"}$clear"
# curl -XPOST -H 'token: this_is_the_token_0' -d '{"channelName": "thebooth"}' "$url/join-channel"

# echo -e "\n\n$green{\"success\":false,\"reason\":\"channelName field missing\"}$clear"
# curl -XPOST -H 'token: this_is_the_token_3' -d '{}' "$url/join-channel"

# echo -e "\n\n$green{\"success\":false,\"reason\":\"Channel does not exist\"}$clear"
# curl -XPOST -H 'token: this_is_the_token_3' -d '{"channelName": "thecell"}' "$url/join-channel"

# echo -e "\n\n$green{\"success\":false,\"reason\":\"User has already joined\"}$clear"
# curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thewire"}' "$url/join-channel"

# echo -e "\n\n$green{\"success\":false,\"reason\":\"User is banned\"}$clear"
# curl -XPOST -H 'token: this_is_the_token_2' -d '{"channelName": "thewire"}' "$url/join-channel"

# /leave-channel ---------------------------------------------------------------
echo -e "\n\n$red/leave-channel$clear"
echo -e "$green{\"success\":true}$clear"
curl -XPOST -H 'token: this_is_the_token_3' -d '{"channelName": "thebooth"}' "$url/leave-channel"

echo -e "\n\n$green{\"success\":false,\"reason\":\"token field missing\"}$clear"
curl -XPOST -d '{"channelName": "thewire"}' "$url/leave-channel"

echo -e "\n\n$green{\"success\":false,\"reason\":\"Invalid token\"}$clear"
curl -XPOST -H 'token: this_is_not_the_token' -d '{"channelName": "thewire"}' "$url/leave-channel"

echo -e "\n\n$green{\"success\":false,\"reason\":\"channelName field missing\"}$clear"
curl -H 'token: this_is_the_token' -d '{}' "$url/leave-channel"

echo -e "\n\n$green{\"success\":false,\"reason\":\"Channel does not exist\"}$clear"
curl -H 'token: this_is_the_token' -d '{"channelName": "thewir"}' "$url/leave-channel"

echo -e "\n\n$green{\"success\":false,\"reason\":\"User is not part of this channel\"}$clear"
curl -H 'token: this_is_the_token_3' -d '{"channelName": "thewire"}' "$url/leave-channel"

# /joined ----------------------------------------------------------------------
echo -e "\n\n$red/joined$clear"
echo -e "$green{\"success\":true,\"joined\":[]}$clear"
curl -XGET -H 'token: this_is_the_token' "$url/joined?channelName=thewire"

echo -e "\n\n$green{\"success\":false,\"reason\":\"User is not part of this channel\"}$clear"
curl -XGET -H 'token: this_is_the_token_3' "$url/joined?channelName=thewire"

echo -e "\n\n$green{\"success\":false,\"reason\":\"Channel does not exist\"}$clear"
curl -XGET -H 'token: this_is_the_token' "$url/joined?channelName=thewir"

# /delete ----------------------------------------------------------------------
echo -e "\n\n$red/delete$clear"
echo -e "$green{\"success\":true}$clear"
curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thewire"}' 'https://onyx-frequent-holiday.glitch.me/delete'

echo -e "\n\n$green{\"success\":false,\"reason\":\"token field missing\"}$clear";
curl -XPOST -d '{"channelName": "thewire"}' 'https://onyx-frequent-holiday.glitch.me/delete'

echo -e "\n\n$green{\"success\":false,\"reason\":\"Invalid token\"}$clear";
curl -XPOST -H 'token: this_is_not_the_token' -d '{"channelName": "thewire"}' 'https://onyx-frequent-holiday.glitch.me/delete'

echo -e "\n\n$green{\"success\":false,\"reason\":\"Channel does not exist\"}$clear";
curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thewir"}' 'https://onyx-frequent-holiday.glitch.me/delete'

echo -e "\n\n$green{\"success\":false,\"reason\":\"channelName field missing\"}$clear";
curl -XPOST -H 'token: this_is_the_token' -d '{}' 'https://onyx-frequent-holiday.glitch.me/delete'

echo -e "\n\n$green{\"success\":false,\"reason\":\"you cannot do that\"}$clear";
curl -XPOST -H 'token: this_is_the_token' -d '{"channelName": "thebooth"}' 'https://onyx-frequent-holiday.glitch.me/delete'


# /kick ------------------------------------------------------------------------
echo -e "\n\n$red/kick$clear"
echo -e "$green{\"success\":true}$clear"

# /ban -------------------------------------------------------------------------
echo -e "\n\n$red/ban$clear"
echo -e "$green{\"success\":true}$clear"

# /message ---------------------------------------------------------------------
echo -e "\n\n$red/message$clear"
echo -e "$green{\"success\":true}$clear"

# /messages --------------------------------------------------------------------
echo -e "\n\n$red/messages$clear"
echo -e "$green{\"success\":true}$clear"

echo -e "\n\n${green}Test completed${clear}"