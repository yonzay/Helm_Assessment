import http_status from 'http-status';
import { Request, Response } from 'express';
import { catch_async } from '../../utility/catch_async';
import { app } from '../..';
import { verify_token } from '../../utility/verify_token';
import { token_state } from '../../utility/definitions';
import { user_verified } from '../../utility/user_verified';
import { ObjectId, AnyBulkWriteOperation, Document, SetFields} from 'mongodb';
import { invitation, InvitationStatus, event_schema, participant, user_schema } from '../../database/definitions';
import { SHA256 } from 'crypto-js';

class AuthUpdateController {
    public static update_user = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        let update_user: {
            [key: string]: any;
        } = {};
        if (req.body.first_name) update_user.first_name = req.body.first_name;
        if (req.body.last_name) update_user.last_name = req.body.last_name;
        if (req.body.email) {
            if (await app.database.already_exists('users', { 'credentials.email': req.body.email })) {
                res.status(http_status.BAD_REQUEST).send({ message: 'email is already in use' });
                return;
            }
            update_user['credentials.email'] = req.body.email;
        }
        if (req.body.password) {
            if (!req.body.new_password) {
                res.status(http_status.BAD_REQUEST).send({ message: 'a new password is required if you wish to change your current one' });
                return;
            }
            if ((SHA256(req.body.password).toString() != (await app.database.client.users.findOne({ _id: req.body.user_id }) as user_schema).credentials.password) && !token_details.is_admin) {
                res.status(http_status.BAD_REQUEST).send({ message: 'password is incorrect' });
                return;
            }
            update_user['credentials.password'] = SHA256(req.body.new_password).toString();
        }
        if (req.body.username) {
            if (await app.database.already_exists('users', { username: req.body.username })) {
                res.status(http_status.BAD_REQUEST).send({ message: 'username is already in use' });
                return;
            }
            update_user.username = req.body.username;
        }
        if (req.body.date_of_birth) update_user.date_of_birth = new Date(`${ req.body.date_of_birth.month }-${ req.body.date_of_birth.day }-${ req.body.date_of_birth.year }`);
        if (token_details.is_admin) {
            if (req.body.invitations) {
                for (let x: number = 0; x < req.body.invitations.length; x++) {
                    if (req.body.invitations[x]._id) update_user[`invitations.${ x }._id`] = new ObjectId(req.body.invitations[x]._id);
                    if (req.body.invitations[x].recipient_id) update_user[`invitations.${ x }.recipient_id`] = new ObjectId(req.body.invitations[x].recipient_id);
                    if (req.body.invitations[x].event_id) update_user[`invitations.${ x }.event_id`] = new ObjectId(req.body.invitations[x].event_id);
                    if (req.body.invitations[x].invitation_status) update_user[`invitations.${ x }.invitation_status`] = req.body.invitations[x].invitation_status;
                    if (req.body.invitations[x].vip) update_user[`invitations.${ x }.vip`] = req.body.invitations[x].vip;
                }
            }
            if (req.body.subscribed_event_ids) (update_user.subscribed_event_ids as ObjectId[]) = (req.body.subscribed_event_ids as string[]).map(subscribed_event_id => new ObjectId(subscribed_event_id));
        }
        const result: number = (await app.database.client.users.updateOne({ _id: req.body.user_id }, { $set: update_user })).modifiedCount;
        result == 1 ? res.status(http_status.OK).send({ updated_user: update_user }) : res.status(http_status.NOT_MODIFIED).send({ message: 'no change occurred' });
    });
    public static update_event = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        req.body.event._id = new ObjectId(req.body.event._id);
        const current_event: event_schema = (await app.database.client.events.findOne({ _id: req.body.event._id })) as event_schema;
        if (!current_event) {
            res.status(http_status.BAD_REQUEST).send({ message: 'event does not exist'});
            return;
        }
        if (!current_event.host_id.equals(req.body.user_id) && !token_details.is_admin) {
            res.status(http_status.UNAUTHORIZED).send({ message: 'you are not the host of this event' });
            return;
        }
        if ((req.body.event.start_date && !req.body.event.start_time) || (!req.body.event.start_date && req.body.event.start_time)) {
            res.status(http_status.BAD_REQUEST).send({ message: 'updating start date or start time requires both to be specified'});
            return;
        }
        if ((req.body.event.end_date && !req.body.event.end_time) || (!req.body.event.end_date && req.body.event.end_time)) {
            res.status(http_status.BAD_REQUEST).send({ message: 'updating end date or end time requires both to be specified'});
            return;
        }
        let update_event: {
            [key: string]: any;
        } = {};
        if (req.body.event.name) {
            if (await app.database.already_exists('events', { name: req.body.event.name })) {
                res.status(http_status.BAD_REQUEST).send({ message: 'this event name is currently in use' });
                return;
            }
            update_event.name = req.body.event.name;
        }
        if (req.body.event.start_date) {
            const current_date: Date = new Date();
            const start_time: number = req.body.event.start_time.meridiem == 'AM' ? (req.body.event.start_time.hour * 3600000) + (req.body.event.start_time.minute * 60000) : ((req.body.event.start_time.hour + 12) * 3600000) + (req.body.event.start_time.minute * 60000);
            if (start_time >= 86400000) {
                res.status(http_status.BAD_REQUEST).send({ message: 'start time must reside within the start date of the event' });
                return;
            }
            const start_date: Date = new Date(new Date(`${ req.body.event.start_date.month }-${ req.body.event.start_date.day }-${ req.body.event.start_date.year }`).getTime() + start_time);
            if (start_date.getTime() < current_date.getTime()) {
                res.status(http_status.BAD_REQUEST).send({ message: 'cannot schedule events in the past' });
                return;
            }
            update_event.start_date = start_date;
        }
        if (req.body.event.end_date) {
            const current_date: Date = new Date();
            const end_time: number = req.body.event.end_time.meridiem == 'AM' ? (req.body.event.end_time.hour * 3600000) + (req.body.event.end_time.minute * 60000) : ((req.body.event.end_time.hour + 12) * 3600000) + (req.body.event.end_time.minute * 60000);
            if (end_time >= 86400000) {
                res.status(http_status.BAD_REQUEST).send({ message: 'end time must reside within the end date of the event' });
                return;
            }
            const end_date: Date = new Date(new Date(`${ req.body.event.end_date.month }-${ req.body.event.end_date.day }-${ req.body.event.end_date.year }`).getTime() + end_time);
            if (end_date.getTime() < current_date.getTime()) {
                res.status(http_status.BAD_REQUEST).send({ message: 'cannot schedule events in the past' });
                return;
            }
            update_event.end_date = end_date;
        }
        if (req.body.event.start_date && req.body.event.end_time) {
            if ((update_event.end_date.getTime() - update_event.start_date.getTime()) < 1800000) {
                res.status(http_status.BAD_REQUEST).send({ message: 'event must last a minimum of 30 minutes' });
                return;
            }
        } 
        if (req.body.event.start_date && !req.body.event.end_time) {
            if ((current_event.end_date.getTime() - update_event.start_date.getTime()) <  1800000) {
                res.status(http_status.BAD_REQUEST).send({ message: 'event must last a minimum of 30 minutes' });
                return;
            }
        } 
        if (req.body.event.end_date && !req.body.event.start_date) {
            if ((update_event.end_date.getTime() - current_event.start_date.getTime()) <  1800000) {
                res.status(http_status.BAD_REQUEST).send({ message: 'event must last a minimum of 30 minutes' });
                return;
            }
        }
        if (req.body.event.participants) {
            (update_event.participants as participant[]) = (req.body.event.participants as { user_id: string; required: boolean; }[]).map(participant => {
                return { user_id: new ObjectId(participant.user_id), required: participant.required };
            });
        }
        if (req.body.event.join_request_ids) (update_event.join_request_ids as ObjectId[]) = (req.body.event.join_request_ids as string[]).map(join_request_id => new ObjectId(join_request_id));
        const result: number = (await app.database.client.events.updateOne({ _id: req.body.event._id }, { $set: update_event })).modifiedCount;
        result == 1 ? res.status(http_status.OK).send({ updated_event: update_event }) : res.status(http_status.NOT_MODIFIED).send({ message: 'no change occurred' });
    });
    public static update_participants = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        req.body.event_id = new ObjectId(req.body.event_id);
        const current_event: event_schema = (await app.database.client.events.findOne({ _id: req.body.event_id })) as event_schema;
        if (!current_event) {
            res.status(http_status.BAD_REQUEST).send({ message: 'event does not exist'});
            return;
        }
        if (!current_event.host_id.equals(req.body.user_id) && !token_details.is_admin) {
            res.status(http_status.UNAUTHORIZED).send({ message: 'you are not the host of this event' });
            return;
        }
        (req.body.participants as participant[]) = (req.body.participants as { user_id: string; required: boolean; }[]).map(participant => {
            return { user_id: new ObjectId(participant.user_id), required: participant.required };
        });
        switch (req.body.action) {
            case 'invite': {
                let participants_to_invite: AnyBulkWriteOperation<Document>[] = [];
                (req.body.participants as participant[]).forEach(participant => participants_to_invite.push({
                    updateOne: {
                        filter: {
                            _id: participant.user_id
                        },
                        update: {
                            $addToSet: {
                                invitations: {
                                    _id: new ObjectId(),
                                    recipient_id: participant.user_id,
                                    event_id: req.body.event_id,
                                    invitation_status: InvitationStatus.pending,
                                    vip: participant.required
                                } as invitation
                            } as unknown as SetFields<Document>
                        }
                    }
                }));
                if ((await app.database.client.events.bulkWrite(participants_to_invite)).isOk()) {
                    res.status(http_status.OK).send({ message: 'invitations sent' });
                    return;
                } else {
                    res.status(http_status.NOT_MODIFIED).send({ message: 'failed to invite users' });
                    return;
                }
            }
            case 'mark': {
                let update_marks: {
                    [key: string]: any;
                } = {};
                for (let x: number = 0; x < current_event.participants.length; x++) {
                    if ((req.body.participants as participant[]).find(participant => participant.user_id.equals(current_event.participants[x].user_id))) {
                        update_marks[`participants.${ x }.required`] = req.body.participants[x].required;
                    }
                }
                if ((await app.database.client.events.updateOne({ _id: req.body.event_id }, { $set: update_marks })).modifiedCount) {
                    res.status(http_status.OK).send({ updated_participants: req.body.participants });
                    return;
                } else {
                    res.status(http_status.NOT_MODIFIED).send({ message: 'no change occurred' });
                    return;
                }
            }
            case 'remove': {
                let user_ids_to_remove: ObjectId[] = [];
                let is_host: boolean = false;
                (req.body.participants as participant[]).forEach(participant => {
                    if (participant.user_id.equals(req.body.user_id)) is_host = true;
                    user_ids_to_remove.push(participant.user_id);
                });
                if (is_host) {
                    res.status(http_status.BAD_REQUEST).send({ message: 'you cannot remove yourself from the event' });
                    return;
                }
                await app.database.client.events.updateOne({ _id: req.body.event_id }, { $pull: { participants: { user_id: { $in: user_ids_to_remove } } } });
                let participants_to_remove: AnyBulkWriteOperation<Document>[] = [];
                user_ids_to_remove.forEach(user_id => participants_to_remove.push({
                    updateOne: {
                        filter: {
                            _id: user_id
                        },
                        update: {
                            $pull: {
                                subscribed_event_ids: req.body.event_id
                            }
                        }
                    }
                }));
                if ((await app.database.client.users.bulkWrite(participants_to_remove)).isOk()) {
                    res.status(http_status.OK).send({ message: 'users removed' });
                    return;
                } else {
                    res.status(http_status.NOT_MODIFIED).send({ message: 'failed to remove users' });
                    return;
                }
            }
        }
    });
};

export { AuthUpdateController }