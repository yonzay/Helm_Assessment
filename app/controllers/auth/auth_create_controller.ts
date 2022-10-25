import http_status from 'http-status';
import { Request, Response } from 'express';
import { catch_async } from '../../utility/catch_async';
import { app } from '../..';
import { ObjectId, AnyBulkWriteOperation, Document, SetFields } from 'mongodb';
import { user_schema, event_schema, participant, invitation, InvitationStatus } from '../../database/definitions';
import { SHA256 } from 'crypto-js';
import { authorize_user } from '../../utility/authorize_user';
import { verify_token } from '../../utility/verify_token';
import { token_state } from '../../utility/definitions';
import { user_verified } from '../../utility/user_verified';

class AuthCreateController {
    public static create_user = catch_async(async (req: Request, res: Response): Promise<void> => {
        if (await app.database.already_exists('users', { 'credentials.email': req.body.email })) {
            res.status(http_status.BAD_REQUEST).send({ message: 'email is already in use' });
            return;
        }
        if (await app.database.already_exists('users', { username: req.body.username })) {
            res.status(http_status.BAD_REQUEST).send({ message: 'username is already in use' });
            return;
        }
        let new_user: user_schema = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            credentials: {
                email: req.body.email,
                password: SHA256(req.body.password).toString()
            },
            username: req.body.username,
            date_of_birth: new Date(`${ req.body.date_of_birth.month }-${ req.body.date_of_birth.day }-${ req.body.date_of_birth.year }`),
            date_joined: new Date(),
            invitations: [],
            subscribed_event_ids: []
        };
        new_user._id = (await app.database.client.users.insertOne(new_user)).insertedId;
        res.status(http_status.CREATED).send({ session_token: authorize_user(new_user._id), user: new_user });
    });
    public static create_event = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        if (await app.database.already_exists('events', { name: req.body.event.name })) {
            res.status(http_status.BAD_REQUEST).send({ message: 'this event name is currently in use' });
            return;
        }
        const start_time: number = req.body.event.start_time.meridiem == 'AM' ? (req.body.event.start_time.hour * 3600000) + (req.body.event.start_time.minute * 60000) : ((req.body.event.start_time.hour + 12) * 3600000) + (req.body.event.start_time.minute * 60000);
        if (start_time >= 86400000) {
            res.status(http_status.BAD_REQUEST).send({ message: 'start time must reside within the start date of the event' });
            return;
        }
        const start_date: Date = new Date(new Date(`${ req.body.event.start_date.month }-${ req.body.event.start_date.day }-${ req.body.event.start_date.year }`).getTime() + start_time);
        const end_time: number = req.body.event.end_time.meridiem == 'AM' ? (req.body.event.end_time.hour * 3600000) + (req.body.event.end_time.minute * 60000) : ((req.body.event.end_time.hour + 12) * 3600000) + (req.body.event.end_time.minute * 60000);
        if (end_time >= 86400000) {
            res.status(http_status.BAD_REQUEST).send({ message: 'end time must reside within the end date of the event' });
            return;
        }
        const end_date: Date = new Date(new Date(`${ req.body.event.end_date.month }-${ req.body.event.end_date.day }-${ req.body.event.end_date.year }`).getTime() + end_time);
        const current_date: Date = new Date();
        if (start_date.getTime() < current_date.getTime() || end_date.getTime() < current_date.getTime()) {
            res.status(http_status.BAD_REQUEST).send({ message: 'cannot schedule events in the past' });
            return;
        }
        if ((end_date.getTime() - start_date.getTime()) < 1800000) {
            res.status(http_status.BAD_REQUEST).send({ message: 'event must last a minimum of 30 minutes' });
            return;
        }
        let new_event: event_schema = {
            name: req.body.event.name,
            host_name: (await app.database.client.users.findOne({ _id: req.body.user_id }).then((result: any) => {
                return result.first_name + ' ' + result.last_name;
            })),
            host_id: req.body.user_id,
            start_date: start_date,
            end_date: end_date,
            participants: [
                {
                    user_id: req.body.user_id,
                    required: true
                }
            ],
            join_request_ids: []
        }
        new_event._id = (await app.database.client.events.insertOne(new_event)).insertedId;
        await app.database.client.users.updateOne({ _id: req.body.user_id }, { $push: { subscribed_event_ids: new_event._id } });
        // invite selected participants if there are any
        if (req.body.event.participants) {
            (req.body.event.participants as participant[]) = (req.body.event.participants as { user_id: string; required: boolean; }[]).map(participant => {
                return { user_id: new ObjectId(participant.user_id), required: participant.required };
            });
            let participants_to_invite: AnyBulkWriteOperation<Document>[] = [];
            (req.body.event.participants as participant[]).forEach(participant => participants_to_invite.push({
                updateOne: {
                    filter: {
                        _id: participant.user_id
                    },
                    update: {
                        $addToSet: {
                            invitations: {
                                _id: new ObjectId(),
                                recipient_id: participant.user_id,
                                event_id: new_event._id,
                                invitation_status: InvitationStatus.pending,
                                vip: participant.required
                            } as invitation
                        } as unknown as SetFields<Document>
                    }
                }
            }));
            if ((await app.database.client.users.bulkWrite(participants_to_invite)).isOk()) {
                res.status(http_status.CREATED).send({ event: new_event, message: 'invitations sent' });
                return;
            } else {
                res.status(http_status.CREATED).send({ event: new_event, message: 'failed to invite users' });
                return;
            }
        }
        res.status(http_status.CREATED).send({ event: new_event });
    });
};

export { AuthCreateController }