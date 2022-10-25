# Helm_Assessment
 Take home assessment from Helm.

## Getting Started

Make sure Node.js is installed and clone this repo using `git clone https://github.com/yonzay/Helm_Assessment.git`

In the root directory run `npm i` to install all necessary dependencies

In `.env.json` change the key `mongodb_url` to your authenticated MongoDB URL

Warning: The IP address and port number are hard coded in the front-end so for it to work don't change the IP and make sure nothing else is listening on the specified port

Now you should be able to run `npm run backend` from the root directory to start the server

Additionally in another terminal that also resides in the root directory you should be able to run `npm run dashboard` to start the front-end. Navigate to http://localhost:3000/register when the front-end starts

You need a `session_token` to make requests to most parts of the API, this can either be a user level `session_token` created at login or registration or an admin level `session_token` which can effect all accounts and is configured in `.env.json`. Use the latter for testing.

You need a `user_id` to make requests to most parts of the API, this key indicates the who the is invoker of an action is or the intended effected user, this can be obtained by creating a user and storing the returned `_id`.

For optional keys in requests to the API, they are only optional when they are not specified, they cannot be empty otherwise the validation layer will ask that you specifiy it.

While using the front-end if you ever encounter `invalid session token` or a page that indicates that you're unauthorized then that means your session has expired and you need to relogin, sessions last 15 minutes.

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

Creates an event with the specified fields, all fields are required except `participants`.

If `participants` is specified users are not directly added to the event, they are instead invited by mass.

If successful the status code will be 201 and the created event will be sent back in JSON format.

```json
{
  "user_id": "",
  "event": {
    "name": "",
    "start_date": {
      "month": 0,
      "day": 0,
      "year": 0
    },
    "start_time": {
      "minute": 0,
      "hour": 0,
      "meridiem": "AM"
    },
    "end_date": {
      "month": 9,
      "day": 25,
      "year": 2027
    },
    "end_time": {
      "minute": 0,
      "hour": 0,
      "meridiem": "AM"
    },
    "participants": [{
      "_id": "",
      "required": ""
    }]
  },
  "session_token": ""
}
```

http://127.0.0.1:8080/api/v1/auth/update/update_user

Updates an existing user with the specified fields, all specified fields **override** the current values of those fields, all fields are optional except `user_id` and `session_token`.

```json
{
    "user_id": "",
    "first_name": "",
    "last_name": "",
    "email": "",
    "password": "",
    "new_password": "",
    "username": "",
    "date_of_birth": {
        "month": 0,
        "day": 0,
        "year": 0
    },
    "invitations": [{
        "_id": "",
        "user_id": "",
        "event_id": "",
        "invitation_status": 0,
        "vip": false
    }],
    "subscribed_event_ids": [],
    "session_token": ""
}
```

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