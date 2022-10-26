import request from 'supertest';
import { event_schema, user_schema } from '../database/definitions';
import { app } from '..';
import { ObjectId } from 'mongodb';

describe('Helm_Assessment Tests', () => {
    let test_host: user_schema;
    let test_event: event_schema;
    let test_recipient: user_schema;
    let delete_user: user_schema;
    let delete_event: user_schema;
    it('Creates three test users and stores them to test other user actions', async () => {
        await new Promise(e => setTimeout(e, 3000));
        let response = await request(app.app_instance).post('/api/v1/auth/create/create_user').send({
            first_name: 'John',
            last_name: 'Doe',
            email: 'john_doe@email.com',
            password: 'John&Doe123Pass654',
            username: 'magicperson',
            date_of_birth: {
                month: 5,
                day: 15,
                year: 1999
            }
        });
        expect(response.statusCode).toBe(201);
        test_host = response.body.user;
        test_host.session_token = response.body.session_token;
        response = await request(app.app_instance).post('/api/v1/auth/create/create_user').send({
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'Jane_doe@email.com',
            password: 'Jane&Doe123Pass654',
            username: 'mageperson',
            date_of_birth: {
                month: 5,
                day: 15,
                year: 1995
            }
        });
        expect(response.statusCode).toBe(201);
        test_recipient = response.body.user;
        test_recipient.session_token = response.body.session_token;
        response = await request(app.app_instance).post('/api/v1/auth/create/create_user').send({
            first_name: 'Delete',
            last_name: 'Me',
            email: 'delete_me@email.com',
            password: 'deleteme123Pass654',
            username: 'deleteme',
            date_of_birth: {
                month: 5,
                day: 15,
                year: 1980
            }
        });
        expect(response.statusCode).toBe(201);
        delete_user = response.body.user;
        delete_user.session_token = response.body.session_token;
    });
    it('Creates a test event using the test host and another one to be deleted later using the delete me test user', async () => {
        let response = await request(app.app_instance).post('/api/v1/auth/create/create_event').send({
            user_id: test_host._id,
            event: {
                name: 'Test Event',
                start_date: {
                    month: 11,
                    day: 19,
                    year: 2022
                },
                start_time: {
                    minute: 30,
                    hour: 2,
                    meridiem: 'PM'
                },
                end_date: {
                    month: 11,
                    day: 19,
                    year: 2022
                },
                end_time: {
                    minute: 30,
                    hour: 4,
                    meridiem: 'PM'
                }
                /*participants: [{ // Other endpoints are going to be used to add participants
                    user_id: "",
                    required: ""
                }]*/
            },
            session_token: test_host.session_token
        });
        test_event = response.body.event;
        expect(response.statusCode).toBe(201);
        response = await request(app.app_instance).post('/api/v1/auth/create/create_event').send({
            user_id: delete_user._id,
            event: {
                name: 'Delete Event',
                start_date: {
                    month: 11,
                    day: 19,
                    year: 2022
                },
                start_time: {
                    minute: 30,
                    hour: 2,
                    meridiem: 'PM'
                },
                end_date: {
                    month: 11,
                    day: 19,
                    year: 2022
                },
                end_time: {
                    minute: 30,
                    hour: 4,
                    meridiem: 'PM'
                }
                /*participants: [{ // Other endpoints are going to be used to add participants
                    user_id: '',
                    required: ''
                }]*/
            },
            session_token: delete_user.session_token
        });
        delete_event = response.body.event;
        expect(response.statusCode).toBe(201);
    });
    it('Updates details about the test recipient', async () => {
        const response = await request(app.app_instance).post('/api/v1/auth/update/update_user').send({
            user_id: test_recipient._id,
            first_name: 'Joe',
            last_name: 'Jane',
            email: 'joe_jane@gmail.com',
            password: 'Jane&Doe123Pass654',
            new_password: 'JoeJane123&&',
            username: 'JoeJane',
            date_of_birth: {
                month: 10,
                day: 4,
                year: 1998
            },
            /*invitations: [{ //this will be tested via the invitations endpoint
                _id: "",
                user_id: "",
                event_id: "",
                invitation_status: 0,
                vip: false
            }],*/
            //subscribed_event_ids: [], //this will be tested via invitations and join requests
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(200);
    });
    it('Updates details about the test hosts event', async () => {
        const response = await request(app.app_instance).post('/api/v1/auth/update/update_event').send({
            user_id: test_host._id,
            event: {
                _id: test_event._id,
                name: 'PublicMarch',
                start_date: {
                    month: 12,
                    day: 3,
                    year: 2022
                },
                start_time: {
                    minute: 30,
                    hour: 1,
                    meridiem: 'PM'
                },
                end_date: {
                    month: 12,
                    day: 4,
                    year: 2022
                },
                end_time: {
                    minute: 30,
                    hour: 1,
                    meridiem: 'PM'
                }
                /*participants: [{ // only admins can directly update the participants of an event and its not recommended to do because it only effects the event's document its better to invite and let them accept
                    user_id: "",
                    required: false
                }]*/
            },
            session_token: test_host.session_token
        });
        expect(response.statusCode).toBe(200);
    });
    it('Deletes the test delete event', async () => {
        const response = await request(app.app_instance).post('/api/v1/auth/delete/delete_event').send({
            user_id: delete_user._id,
            event_id: delete_event._id,
            session_token: delete_user.session_token
        });
        expect(response.statusCode).toBe(200);
    });
    it('Deletes the test delete user', async () => {
        const response = await request(app.app_instance).post('/api/v1/auth/delete/delete_user').send({
            user_id: delete_user._id,
            session_token: delete_user.session_token
        });
        expect(response.statusCode).toBe(204);
    });
    it('Attempts to login to the test hosts account', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/login').send({
            email: test_host.credentials.email,
            password: 'John&Doe123Pass654'
        });
        expect(response.statusCode).toBe(200);
    });
    it('Extends the duration of the test hosts session token by 15 minutes', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/extend_session').send({
            user_id: test_host._id,
            session_token: test_host.session_token
        });
        expect(response.statusCode).toBe(204);
    });
    it('Test recipient queries various types of data pertaining to users and events', async () => {
        const current_date = new Date();
        let response = await request(app.app_instance).post('/api/v1/user/query').send({
            //gets all events that take place this year
            type: 'events',
            user_id: test_recipient._id,
            events: {
                type: 'date_range',
                //by_participant: '',
                by_date_range: {
                    start_date: {
                        month: current_date.getMonth() + 1,
                        day: current_date.getDate(),
                        year: current_date.getFullYear()
                    },
                    end_date: {
                        month: current_date.getMonth() + 1,
                        day: current_date.getDate(),
                        year: current_date.getFullYear() + 1
                    }
                },
                //by_singletons: []
            },
            /*users: {
                type: '',
                offset: 0,
                range: 0,
                by_singletons: []
            },*/
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(200);
        response = await request(app.app_instance).post('/api/v1/user/query').send({
            //gets all events that have the test_host in them
            type: 'events',
            user_id: test_recipient._id,
            events: {
                type: 'participant',
                by_participant: 'magicperson',
                /*by_date_range: {
                    start_date: {
                        month: 0,
                        day: 0,
                        year: 0
                    },
                    end_date: {
                        month: 0,
                        day: 0,
                        year: 0
                    }
                },
                by_singletons: []*/
            },
            /*users: {
                type: '',
                offset: 0,
                range: 0,
                by_singletons: []
            },*/
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(200);
        response = await request(app.app_instance).post('/api/v1/user/query').send({
            //gets a pool of available users starting from the 0th user to the 20th user if they exist
            type: 'users',
            user_id: test_recipient._id,
            /*events: {
                type: '',
                by_participant: '',
                by_date_range: {
                    start_date: {
                        month: 0,
                        day: 0,
                        year: 0
                    },
                    end_date: {
                        month: 0,
                        day: 0,
                        year: 0
                    }
                },
                by_singletons: []
            },*/
            users: {
                type: 'range',
                offset: 1,
                range: 20,
                //by_singletons: []
            },
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(200);
    });
    it('The test recipient sends a join request to the test hosts event', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/join_request').send({
            user_id: test_recipient._id,
            event_id: test_event._id,
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(204);
    });
    it('The test host accepts the join request from the test recipient', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/reply').send({
            type: 'join_request',
            user_id: test_host._id,
            join_request: {
                event_id: test_event._id,
                from_user_id: test_recipient._id,
                required: false,
                response: true
            },
            /*invitation: {
                _id: '',
                response: false
            },*/
            session_token: test_host.session_token
        });
        expect(response.statusCode).toBe(204);
    });
    it('The test recipient leaves the recently joined event', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/leave_event').send({
            user_id: test_recipient._id,
            event_id: test_event._id,
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(204);
    });
    it('The test host invites the test recipient back to the event', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/send_invitation').send({
            user_id: test_host._id,
            event_id: test_event._id,
            recipient_id: test_recipient._id,
            vip: false,
            session_token: test_host.session_token
        });
        expect(response.statusCode).toBe(204);
    });
    it('The test recipient accepts the invitation from the test host', async () => {
        const response = await request(app.app_instance).post('/api/v1/user/reply').send({
            type: 'invitation',
            user_id: test_recipient._id,
            /*join_request: {
                event_id: '',
                from_user_id: '',
                required: false,
                response: false
            },*/
            invitation: {
                _id: (await app.database.client.users.findOne({ _id: new ObjectId(test_recipient._id) }) as user_schema).invitations[0]._id,
                response: true
            },
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(200);
    });
    it('The test host kicks the test recipient out of the event', async () => {
        const response = await request(app.app_instance).post('/api/v1/auth/update/update_participants').send({
            action: 'remove',
            user_id: test_host._id,
            event_id: test_event._id,
            participants: [{
                user_id: test_recipient._id,
                /*required: false*/
            }],
            session_token: test_host.session_token
        });
        expect(response.statusCode).toBe(200);
    });
    it('Both the test host and the test recipient logout, which deletes their session token rendering them unable to interact with the API until they login to get a new one', async () => {
        let response = await request(app.app_instance).post('/api/v1/user/logout').send({
            user_id: test_host._id,
            session_token: test_host.session_token
        });
        expect(response.statusCode).toBe(204);
        response = await request(app.app_instance).post('/api/v1/user/logout').send({
            user_id: test_recipient._id,
            session_token: test_recipient.session_token
        });
        expect(response.statusCode).toBe(204);
    });
});

///api/v1/user/logout