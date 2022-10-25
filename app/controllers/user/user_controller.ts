import http_status from 'http-status';
import { Request, Response } from 'express';
import { catch_async } from '../../utility/catch_async';
import { app } from '../..';
import { user_schema, event_schema, invitation, InvitationStatus, participant } from '../../database/definitions';
import { authorize_user } from '../../utility/authorize_user';
import { ObjectId } from 'mongodb';
import { token_state } from '../../utility/definitions';
import { verify_token } from '../../utility/verify_token';
import { user_verified } from '../../utility/user_verified';
import { SHA256 } from 'crypto-js';

class UserController {
    public static login = catch_async(async (req: Request, res: Response): Promise<void> => {
        const user: user_schema = (await app.database.client.users.findOne({ 'credentials.email': req.body.email }) as user_schema);
        if (user) {
            if (req.body.email != user.credentials.email || SHA256(req.body.password).toString() != user.credentials.password) {
                res.status(http_status.BAD_REQUEST).send({ message: 'incorrect email or password' });
                return;
            }
        } else {
            res.status(http_status.BAD_REQUEST).send({ message: 'incorrect email or password' });
            return;
        }
        res.status(http_status.OK).send({ session_token: authorize_user(new ObjectId(user._id)), user: user });
    });
    public static extend_session = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        const index: number = app.current_sessions.findIndex(session => session.token == req.body.session_token);
        if (index == -1) {
            res.status(http_status.BAD_REQUEST).send({ message: 'session does not exist' });
            return;
        }
        app.current_sessions[index].expiry = new Date().getTime() + 900000;
        res.status(http_status.NO_CONTENT).send();
    });
    public static logout = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        const index: number = app.current_sessions.findIndex(session => session.token == req.body.session_token);
        if (index == -1) {
            res.status(http_status.BAD_REQUEST).send({ message: 'session does not exist' });
            return;
        }
        app.current_sessions.splice(index, 1);
        res.status(http_status.NO_CONTENT).send();
    });
    public static query = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        switch(req.body.type) {
            case 'events': {
                switch(req.body.events.type) {
                    case 'participant': {
                        res.status(http_status.OK).send({ events: (await app.database.client.events.find({ 'participants.user_id': (await app.database.client.users.findOne({ username: req.body.events.by_participant }))?._id }).toArray()) });
                        return; 
                    }
                    case 'date_range': {
                        const start_date: Date = new Date(`${ req.body.events.by_date_range.start_date.month }-${ req.body.events.by_date_range.start_date.day }-${ req.body.events.by_date_range.start_date.year }`);
                        const end_date: Date = new Date(`${ req.body.events.by_date_range.end_date.month }-${ req.body.events.by_date_range.end_date.day }-${ req.body.events.by_date_range.end_date.year }`);
                        const current_date: Date = new Date();
                        if (start_date.getTime() < new Date(current_date.toLocaleDateString()).getTime() || end_date.getTime() < new Date(current_date.toLocaleDateString()).getTime()) {
                            res.status(http_status.BAD_REQUEST).send({ message: 'please use a date range that is in the future' });
                            return;
                        }
                        if (start_date.getTime() >= end_date.getTime()) {
                            res.status(http_status.BAD_REQUEST).send({ message: 'start date must be before the end date and span atleast 1 day' });
                            return;
                        }
                        res.status(http_status.OK).send({ events: (await app.database.client.events.find({ start_date: { $gte: start_date }, end_date: { $lte: end_date } }).toArray()) });
                        return;
                    }
                    case 'singletons': {
                        req.body.events.by_singletons = req.body.events.by_singletons.map((singleton: string) => new ObjectId(singleton));
                        res.status(http_status.OK).send({ events: (await app.database.client.events.find({ _id: { $in: req.body.events.by_singletons } }).toArray()) });
                        return;
                    }
                }
            }
            case 'users': {
                switch(req.body.users.type) {
                    case 'self_query': {
                        res.status(http_status.OK).send({ user: await app.database.client.users.findOne({ _id: req.body.user_id }) });
                        return;
                    }
                    case 'range': {
                        if (!req.body.users.offset || !req.body.users.range) {
                            res.status(http_status.BAD_REQUEST).send({ message: 'if querying by range make sure to provide both an offset and a range' });
                            return;
                        }
                        req.body.users.offset = req.body.users.offset - 1;
                        res.status(http_status.OK).send({ users: (await app.database.client.users.find().skip(req.body.users.offset).limit(req.body.users.range).toArray()) });
                        return;
                    }
                    case 'singletons': {
                        req.body.users.by_singletons = req.body.users.by_singletons.map((singleton: string) => new ObjectId(singleton));
                        res.status(http_status.OK).send({ users: (await app.database.client.users.find({ _id: { $in: req.body.users.by_singletons } }).toArray()) });
                        return;
                    }
                }
            }
        }
    });
    public static join_request = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        req.body.event_id = new ObjectId(req.body.event_id);
        if (!(await app.database.client.events.findOne({ _id: req.body.event_id }))) {
            res.status(http_status.BAD_REQUEST).send({ message: 'event does not exist' });
            return;
        }
        if (((await app.database.client.users.findOne({ _id: req.body.user_id })) as user_schema).subscribed_event_ids.find(subscribed_event_id => subscribed_event_id.equals(req.body.event_id))) {
            res.status(http_status.BAD_REQUEST).send({ message: 'you are already part of this event' });
            return;
        }
        if ((await app.database.client.events.updateOne({ _id: req.body.event_id }, { $addToSet: { join_request_ids: req.body.user_id } })).modifiedCount) {
            res.status(http_status.NO_CONTENT).send();
        } else {
            res.status(http_status.BAD_REQUEST).send({ message: 'failed to send request, perhaps you have already sent one?' });
        }
    });
    public static leave_event = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        req.body.event_id = new ObjectId(req.body.event_id);
        const event: event_schema = await app.database.client.events.findOne({ _id: req.body.event_id }) as event_schema;
        if (!event) {
            res.status(http_status.BAD_REQUEST).send({ message: 'event does not exist' });
            return;
        }
        if (!event.participants.find(participant => participant.user_id.equals(req.body.user_id))) {
            res.status(http_status.UNAUTHORIZED).send({ message: 'you are not part of this event' });
            return;
        }
        if (event.host_id.equals(req.body.user_id)) {
            res.status(http_status.BAD_REQUEST).send({ message: 'you cannot leave this event as you are the host' });
            return;
        }
        await app.database.client.events.updateOne({ _id: req.body.event_id }, { $pull: { participants: { user_id: req.body.user_id } } });
        await app.database.client.users.updateOne({ _id: req.body.user_id }, { $pull: { subscribed_event_ids: req.body.event_id } });
        res.status(http_status.NO_CONTENT).send();
    });
    public static send_invitation = catch_async(async (req: Request, res: Response): Promise<void> => {
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
        if (!current_event.host_id.equals(req.body.user_id) && !token_details.is_admin) {
            res.status(http_status.UNAUTHORIZED).send({ message: 'you are not the host of this event' });
            return;
        }
        req.body.recipient_id = new ObjectId(req.body.recipient_id);
        const recipient: user_schema = (await app.database.client.users.findOne({ _id: req.body.recipient_id })) as user_schema;
        if ((recipient.subscribed_event_ids.find(subscribed_event_id => subscribed_event_id.equals(req.body.event_id)))) {
            res.status(http_status.BAD_REQUEST).send({ message: 'this user is already part of this event' });
            return;
        }
        if (recipient.invitations.find(invitation => invitation.event_id.equals(req.body.event_id))) {
            res.status(http_status.BAD_REQUEST).send({ message: 'this user has already recieved an invitation for this event' });
            return;
        }
        if ((await app.database.client.users.updateOne({ _id: req.body.recipient_id }, { $addToSet: { invitations: {
            _id: new ObjectId(),
            recipient_id: req.body.recipient_id,
            event_id: req.body.event_id,
            invitation_status: InvitationStatus.pending,
            vip: req.body.vip
        } as invitation } })).matchedCount) {
            res.status(http_status.NO_CONTENT).send();
        } else {
            res.status(http_status.BAD_REQUEST).send({ message: 'failed to invite user' });
        }
    });
    public static reply = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        switch (req.body.type) {
            case 'join_request': {
                req.body.join_request.event_id = new ObjectId(req.body.join_request.event_id);
                const current_event: event_schema = (await app.database.client.events.findOne({ _id: req.body.join_request.event_id })) as event_schema;
                if (!current_event.host_id.equals(req.body.user_id) && !token_details.is_admin) {
                    res.status(http_status.UNAUTHORIZED).send({ message: 'you are not the host of this event' });
                    return;
                }
                req.body.join_request.from_user_id = new ObjectId(req.body.join_request.from_user_id);
                if (!req.body.join_request.response) {
                    if ((await app.database.client.events.updateOne({ _id: req.body.join_request.event_id }, { $pull: { join_request_ids: req.body.join_request.from_user_id } })).matchedCount) {
                        res.status(http_status.NO_CONTENT).send();
                        return;
                    } else {
                        res.status(http_status.BAD_REQUEST).send({ message: 'failed to reply' });
                        return;
                    }
                }
                await app.database.client.events.updateOne({ _id: req.body.join_request.event_id }, { $pull: { join_request_ids: req.body.join_request.from_user_id } });
                await app.database.client.events.updateOne({ _id: req.body.join_request.event_id }, { $push: { participants: {
                    user_id: req.body.join_request.from_user_id,
                    required: req.body.join_request.required
                } as participant } });
                await app.database.client.users.updateOne({ _id: req.body.join_request.from_user_id }, { $push: { subscribed_event_ids: req.body.join_request.event_id } });
                res.status(http_status.NO_CONTENT).send();
                return;
            }
            case 'invitation': {
                req.body.invitation._id = new ObjectId(req.body.invitation._id);
                const invitation: invitation | undefined = ((await app.database.client.users.findOne({ _id: req.body.user_id })) as user_schema).invitations.find(invitation => invitation._id?.equals(req.body.invitation._id));
                if (!invitation) {
                    res.status(http_status.BAD_REQUEST).send({ message: 'invitation does not exist' });
                    return;
                }
                await app.database.client.users.updateOne({ _id: req.body.user_id }, { $pull: { invitations: { _id: req.body.invitation._id } } });
                if (!invitation.recipient_id.equals(req.body.user_id)) {
                    res.status(http_status.BAD_REQUEST).send({ message: 'this is not your invitation' });
                    return;
                }
                if (!req.body.invitation.response) {
                    res.status(http_status.NO_CONTENT).send();
                    return;
                }
                await app.database.client.events.updateOne({ _id: invitation.event_id }, { $addToSet: { participants: {
                    user_id: req.body.user_id,
                    required: invitation.vip
                } as participant } });
                await app.database.client.users.updateOne({ _id: req.body.user_id }, { $addToSet: { subscribed_event_ids: invitation.event_id } });
                res.status(http_status.OK).send({ added_to_event: (await app.database.client.events.findOne({ _id: invitation.event_id })) });
                return;
            }
        }
    });
};

export { UserController }