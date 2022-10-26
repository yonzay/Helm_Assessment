import { ObjectSchema, CustomHelpers, ErrorReport } from '@hapi/joi';
import * as Joi from '@hapi/joi';
import { MiscValidations } from './misc_validations';

class AuthValidations {
    public static create_user: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            first_name: Joi.string().required().custom(MiscValidations.first_name),
            last_name: Joi.string().required().custom(MiscValidations.last_name),
            email: Joi.string().required().email(),
            password: Joi.string().required().custom(MiscValidations.password),
            username: Joi.string().required().custom(MiscValidations.username),
            date_of_birth: Joi.object().required().keys({
                month: Joi.number().required(),
                day: Joi.number().required(),
                year: Joi.number().required()
            }).custom(MiscValidations.date)
        })
    };
    public static update_user: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            first_name: Joi.string().optional().custom(MiscValidations.first_name),
            last_name: Joi.string().optional().custom(MiscValidations.last_name),
            email: Joi.string().optional().email(),
            password: Joi.string().optional().custom(MiscValidations.password),
            new_password: Joi.string().optional().custom(MiscValidations.password),
            username: Joi.string().optional().custom(MiscValidations.username),
            date_of_birth: Joi.object().optional().keys({
                month: Joi.number().required(),
                day: Joi.number().required(),
                year: Joi.number().required()
            }).custom(MiscValidations.date),
            invitations: Joi.array().optional().items({
                _id: Joi.string().optional().custom(MiscValidations.object_id),
                user_id: Joi.string().optional().custom(MiscValidations.object_id),
                event_id: Joi.string().optional().custom(MiscValidations.object_id),
                invitation_status: Joi.number().optional().custom((value: number, helpers: CustomHelpers): 0 | 1 | 2 | ErrorReport => {
                    if (value != 0 && value != 1 && value != 2) return helpers.message({ custom: 'invalid invitation status' });
                    return value;
                }),
                vip: Joi.boolean().optional()
            }),
            subscribed_event_ids: Joi.array().optional().items(Joi.string().optional().custom(MiscValidations.object_id)),
            session_token: Joi.string().required()
        })
    };
    public static delete_user: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            session_token: Joi.string().required()
        })
    };
    public static create_event: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event: Joi.object().required().keys({
                name: Joi.string().required().custom(MiscValidations.event_name),
                start_date: Joi.object().required().keys({
                    month: Joi.number().required(),
                    day: Joi.number().required(),
                    year: Joi.number().required()
                }).custom(MiscValidations.date),
                start_time: Joi.object().required().keys({
                    minute: Joi.number().required().max(59),
                    hour: Joi.number().required().max(12),
                    meridiem: Joi.string().required().custom(MiscValidations.meridiem)
                }),
                end_date: Joi.object().required().keys({
                    month: Joi.number().required(),
                    day: Joi.number().required(),
                    year: Joi.number().required()
                }).custom(MiscValidations.date),
                end_time: Joi.object().required().keys({
                    minute: Joi.number().required().max(59),
                    hour: Joi.number().required().max(12),
                    meridiem: Joi.string().required().custom(MiscValidations.meridiem)
                }),
                participants: Joi.array().optional().items(Joi.object().keys({
                    _id: Joi.string().required().custom(MiscValidations.object_id),
                    required: Joi.boolean().required()
                }))
            }),
            session_token: Joi.string().required()
        })
    };
    public static update_event: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event: Joi.object().required().keys({
                _id: Joi.string().required().custom(MiscValidations.object_id),
                name: Joi.string().optional().custom(MiscValidations.event_name),
                start_date: Joi.object().optional().keys({
                    month: Joi.number().required(),
                    day: Joi.number().required(),
                    year: Joi.number().required()
                }).custom(MiscValidations.date),
                start_time: Joi.object().optional().keys({
                    minute: Joi.number().required().max(59),
                    hour: Joi.number().required().max(12),
                    meridiem: Joi.string().required().custom(MiscValidations.meridiem)
                }),
                end_date: Joi.object().optional().keys({
                    month: Joi.number().required(),
                    day: Joi.number().required(),
                    year: Joi.number().required()
                }).custom(MiscValidations.date),
                end_time: Joi.object().optional().keys({
                    minute: Joi.number().required().max(59),
                    hour: Joi.number().required().max(12),
                    meridiem: Joi.string().required().custom(MiscValidations.meridiem)
                }),
                participants: Joi.array().optional().items(Joi.object().keys({
                    _id: Joi.string().required().custom(MiscValidations.object_id),
                    required: Joi.boolean().required()
                })),
                join_requests: Joi.array().optional().items(Joi.string().optional().custom(MiscValidations.object_id))
            }),
            session_token: Joi.string().required()
        })
    };
    public static delete_event: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event_id: Joi.string().required().custom(MiscValidations.object_id),
            session_token: Joi.string().required()
        })
    };
    public static update_participants: {
        body: ObjectSchema<any>;
    } = {
        body: Joi.object().required().keys({
            action: Joi.string().required().custom((value: string, helpers: CustomHelpers): 'invite' | 'mark' | 'remove' | ErrorReport => {
                if (value != 'invite' && value != 'mark' && value != 'remove') return helpers.message({ custom: 'action must either be invite, mark or remove' });
                return value;
            }),
            user_id: Joi.string().required().custom(MiscValidations.object_id),
            event_id: Joi.string().required().custom(MiscValidations.object_id),
            participants: Joi.array().required().items(Joi.object().keys({
                user_id: Joi.string().required().custom(MiscValidations.object_id),
                required: Joi.boolean().optional()
            })),
            session_token: Joi.string().required()
        })
    };
};

export { AuthValidations }