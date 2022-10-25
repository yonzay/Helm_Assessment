import http_status from 'http-status';
import { Request, Response } from 'express';
import { catch_async } from '../../utility/catch_async';
import { app } from '../..';
import { event_schema, participant } from '../../database/definitions';
import { verify_token } from '../../utility/verify_token';
import { token_state } from '../../utility/definitions';
import { user_verified } from '../../utility/user_verified';
import { ObjectId, AnyBulkWriteOperation, Document, SetFields } from 'mongodb';

class AuthDeleteController {
    public static delete_user = catch_async(async (req: Request, res: Response): Promise<void> => {
        const token_details: token_state = verify_token(req.body.session_token);
        req.body.user_id = new ObjectId(req.body.user_id);
        if (!token_details.is_admin) {
            if (!token_details.exists || !user_verified(req.body.user_id, req.body.session_token)) {
                res.status(http_status.UNAUTHORIZED).send({ message: 'invalid session token' });
                return;
            }
        }
        const result: number = (await app.database.client.users.deleteOne({ _id: req.body.user_id })).deletedCount;
        result == 1 ? res.status(http_status.NO_CONTENT).send() : res.status(http_status.NOT_MODIFIED).send({ message: 'failed to delete user' });
    });
    public static delete_event = catch_async(async (req: Request, res: Response): Promise<void> => {
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
            res.status(http_status.UNAUTHORIZED).send({ message: 'event does not exist' });
            return;
        }
        if (!current_event.host_id.equals(req.body.user_id) && !token_details.is_admin) {
            res.status(http_status.UNAUTHORIZED).send({ message: 'you are not the host of this event' });
            return;
        }
        if (!(await app.database.client.events.deleteOne({ _id: req.body.event_id })).deletedCount) {
            res.status(http_status.NOT_MODIFIED).send({ message: 'failed to delete event' });
            return;
        }
        let user_ids_to_remove: ObjectId[] = [];
        (current_event.participants as participant[]).forEach(participant => user_ids_to_remove.push(participant.user_id));
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
            res.status(http_status.OK).send({ message: 'event deleted' });
            return;
        } else {
            res.status(http_status.BAD_REQUEST).send({ message: 'failed to remove users from deleted event' });
            return;
        }
    });
};

export { AuthDeleteController }