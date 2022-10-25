import { object, string, number, boolean, ObjectSchema, CustomHelpers, ErrorReport, array } from 'joi';
import { MiscValidations } from './misc_validations';

class UserValidations {
    public static login: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            email: string().required().email(),
            password: string().required().custom(MiscValidations.password)
        })
    }
    public static extend_session: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            session_token: string().required()
        })
    }
    public static logout: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            session_token: string().required()
        })
    }
    public static query: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            type: string().required().custom((value: string, helpers: CustomHelpers): 'events' | 'users' | ErrorReport => {
                if (value != 'events' && value != 'users') return helpers.message({ custom: 'type of query must either be events or users' });
                return value;
            }),
            user_id: string().required().custom(MiscValidations.object_id),
            events: object().optional().keys({
                type: string().required().custom((value: string, helpers: CustomHelpers): 'participant' | 'date_range' | 'singletons' | ErrorReport => {
                    if (value != 'participant' && value != 'date_range' && value != 'singletons') return helpers.message({ custom: 'type of query must either be participant, date_range, or singletons' });
                    return value;
                }),
                by_participant: string().optional().custom(MiscValidations.username),
                by_date_range: object().optional().keys({
                    start_date: object().required().keys({
                        month: number().required(),
                        day: number().required(),
                        year: number().required()
                    }).custom(MiscValidations.date),
                    end_date: object().required().keys({
                        month: number().required(),
                        day: number().required(),
                        year: number().required()
                    }).custom(MiscValidations.date)
                }),
                by_singletons: array().optional().items(string().optional().custom(MiscValidations.object_id))
            }),
            users: object().optional().keys({
                type: string().required().custom((value: string, helpers: CustomHelpers): 'self_query' | 'range' | 'singletons' | ErrorReport => {
                    if (value != 'self_query' && value != 'range' && value != 'singletons') return helpers.message({ custom: 'type of query must either be self_query, range, or singletons' });
                    return value;
                }),
                offset: number().optional(),
                range: number().optional().max(50),
                by_singletons: array().optional().items(string().optional().custom(MiscValidations.object_id))
            }),
            session_token: string().required()
        })
    }
    public static join_request: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            event_id: string().required().custom(MiscValidations.object_id),
            session_token: string().required()
        })
    }
    public static leave_event: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            event_id: string().required().custom(MiscValidations.object_id),
            session_token: string().required()
        })
    }
    public static send_invitation: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            event_id: string().required().custom(MiscValidations.object_id),
            recipient_id: string().required().custom(MiscValidations.object_id),
            vip: boolean().required(),
            session_token: string().required()
        })
    }
    public static reply: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            type: string().required().custom((value: string, helpers: CustomHelpers): 'join_request' | 'invitation' | ErrorReport => {
                if (value != 'join_request' && value != 'invitation') return helpers.message({ custom: 'type of reply must either be join_request or invitation' });
                return value;
            }),
            user_id: string().required().custom(MiscValidations.object_id),
            join_request: object().optional().keys({
                event_id: string().required().custom(MiscValidations.object_id),
                from_user_id: string().required().custom(MiscValidations.object_id),
                required: boolean().required(),
                response: boolean().required()
            }),
            invitation: object().optional().keys({
                _id: string().required().custom(MiscValidations.object_id),
                response: boolean().required()
            }),
            session_token: string().required()
        })
    }
};

export { UserValidations }