# Helm_Assessment
 Take home assessment from Helm.

## Getting Started

Make sure Node.js is installed and clone this repo using `git clone https://github.com/yonzay/Helm_Assessment.git`

In the root directory run `npm i` to install all necessary dependencies

In `.env.json` change the key `mongodb_url` to your authenticated MongoDB URL

Warning: The IP address and port number are hard coded in the front-end so for it to work don't change the IP and make sure nothing else is listening on the specified port

Now you should be able to run `npm run backend` from the root directory to start the server

Additionally in another terminal that also resides in the root directory you should be able to run `npm run dashboard` to start the front-end. Navigate to http://localhost:3000/register when the front-end starts

You need a session token to make requests to most parts of the API, this can either be a user level session token created at login or registration or an admin level session token which can effect all accounts and is configured in `.env.json`. Use the latter for testing.

## API Documentation

http://127.0.0.1:8080/api/v1/auth/create/create_user

Creates a user with the specified fields, all fields are required.

If successful the status code will be 201 and the created user will be sent back in JSON format with a user level session token to traverse the rest of the API.

```json
{
   "first_name": "",
   "last_name": "",
   "email": "",
   "password": "",
   "username": "",
   "date_of_birth":{
      "year": 0,
      "month": 0,
      "day": 0
   }
}
```

http://127.0.0.1:8080/api/v1/auth/create/create_event

http://127.0.0.1:8080/api/v1/auth/update/update_user

http://127.0.0.1:8080/api/v1/auth/update/update_event

http://127.0.0.1:8080/api/v1/auth/update/update_participants

http://127.0.0.1:8080/api/v1/auth/delete/delete_user

http://127.0.0.1:8080/api/v1/auth/delete/delete_event

https://127.0.0.1:8080/api/v1/user/login

https://127.0.0.1:8080/api/v1/user/extend_session

https://127.0.0.1:8080/api/v1/user/logout

https://127.0.0.1:8080/api/v1/user/query

https://127.0.0.1:8080/api/v1/user/join_request

https://127.0.0.1:8080/api/v1/user/leave_event

https://127.0.0.1:8080/api/v1/user/send_invitation

https://127.0.0.1:8080/api/v1/user/reply