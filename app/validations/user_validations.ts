import { ObjectSchema, CustomHelpers, ErrorReport } from '@hapi/joi';
import * as Joi from '@hapi/joi';
import { MiscValidations } from './misc_validations';

class UserValidations {
    public static login: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            email: Joi.string().required().email(),
            password: Joi.string().required().custom(MiscValidations.password)
        })
    }
    public static extend_session: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            session_token: Joi.string().required()
        })
    }
    public static logout: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            session_token: Joi.string().required()
        })
    }
    public static query: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            type: Joi.string().required().custom((value: string, helpers: CustomHelpers): 'events' | 'users' | ErrorReport => {
                if (value != 'events' && value != 'users') return helpers.message({ custom: 'type of query must either be events or users' });
                return value;
            }),
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            events: Joi.object().optional().keys({
                type: Joi.string().required().custom((value: string, helpers: CustomHelpers): 'participant' | 'date_range' | 'singletons' | ErrorReport => {
                    if (value != 'participant' && value != 'date_range' && value != 'singletons') return helpers.message({ custom: 'type of query must either be participant, date_range, or singletons' });
                    return value;
                }),
                by_participant: Joi.string().optional().custom(MiscValidations.username),
                by_date_range: Joi.object().optional().keys({
                    start_date: Joi.object().required().keys({
                        month: Joi.number().required(),
                        day: Joi.number().required(),
                        year: Joi.number().required()
                    }).custom(MiscValidations.date),
                    end_date: Joi.object().required().keys({
                        month: Joi.number().required(),
                        day: Joi.number().required(),
                        year: Joi.number().required()
                    }).custom(MiscValidations.date)
                }),
                by_singletons: Joi.array().optional().items(Joi.string().optional().custom(MiscValidations.object_id))
            }),
            users: Joi.object().optional().keys({
                type: Joi.string().required().custom((value: string, helpers: CustomHelpers): 'self_query' | 'range' | 'singletons' | ErrorReport => {
                    if (value != 'self_query' && value != 'range' && value != 'singletons') return helpers.message({ custom: 'type of query must either be self_query, range, or singletons' });
                    return value;
                }),
                offset: Joi.number().optional(),
                range: Joi.number().optional().max(50),
                by_singletons: Joi.array().optional().items(Joi.string().optional().custom(MiscValidations.object_id))
            }),
            session_token: Joi.string().required()
        })
    }
    public static join_request: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event_id: Joi.string().required().custom(MiscValidations.object_id),
            session_token: Joi.string().required()
        })
    }
    public static leave_event: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event_id: Joi.string().required().custom(MiscValidations.object_id),
            session_token: Joi.string().required()
        })
    }
    public static send_invitation: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event_id: Joi.string().required().custom(MiscValidations.object_id),
            recipient_id: Joi.string().required().custom(MiscValidations.object_id),
            vip: Joi.boolean().required(),
            session_token: Joi.string().required()
        })
    }
    public static reply: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            type: Joi.string().required().custom((value: string, helpers: CustomHelpers): 'join_request' | 'invitation' | ErrorReport => {
                if (value != 'join_request' && value != 'invitation') return helpers.message({ custom: 'type of reply must either be join_request or invitation' });
                return value;
            }),
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            join_request: Joi.object().optional().keys({
                event_id: Joi.string().required().custom(MiscValidations.object_id),
                from_user_id: Joi.string().required().custom(MiscValidations.object_id),
                required: Joi.boolean().required(),
                response: Joi.boolean().required()
            }),
            invitation: Joi.object().optional().keys({
                _id: Joi.string().required().custom(MiscValidations.object_id),
                response: Joi.boolean().required()
            }),
            session_token: Joi.string().required()
        })
    }
};

export { UserValidations }