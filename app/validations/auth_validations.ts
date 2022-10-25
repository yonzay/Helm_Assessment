import { object, array, string, number, boolean, ObjectSchema, CustomHelpers, ErrorReport } from 'joi';
import { MiscValidations } from './misc_validations';

class AuthValidations {
    public static create_user: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            first_name: string().required().custom(MiscValidations.first_name),
            last_name: string().required().custom(MiscValidations.last_name),
            email: string().required().email(),
            password: string().required().custom(MiscValidations.password),
            username: string().required().custom(MiscValidations.username),
            date_of_birth: object().required().keys({
                month: number().required(),
                day: number().required(),
                year: number().required()
            }).custom(MiscValidations.date)
        })
    };
    public static update_user: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            first_name: string().optional().custom(MiscValidations.first_name),
            last_name: string().optional().custom(MiscValidations.last_name),
            email: string().optional().email(),
            password: string().optional().custom(MiscValidations.password),
            new_password: string().optional().custom(MiscValidations.password),
            username: string().optional().custom(MiscValidations.username),
            date_of_birth: object().optional().keys({
                month: number().required(),
                day: number().required(),
                year: number().required()
            }).custom(MiscValidations.date),
            invitations: array().optional().items({
                _id: string().optional().custom(MiscValidations.object_id),
                user_id: string().optional().custom(MiscValidations.object_id),
                event_id: string().optional().custom(MiscValidations.object_id),
                invitation_status: number().optional().custom((value: number, helpers: CustomHelpers): 0 | 1 | 2 | ErrorReport => {
                    if (value != 0 && value != 1 && value != 2) return helpers.message({ custom: 'invalid invitation status' });
                    return value;
                }),
                vip: boolean().optional()
            }),
            subscribed_event_ids: array().optional().items(string().optional().custom(MiscValidations.object_id)),
            session_token: string().required()
        })
    };
    public static delete_user: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            session_token: string().required()
        })
    };
    public static create_event: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            event: object().required().keys({
                name: string().required().custom(MiscValidations.event_name),
                start_date: object().required().keys({
                    month: number().required(),
                    day: number().required(),
                    year: number().required()
                }).custom(MiscValidations.date),
                start_time: object().required().keys({
                    minute: number().required().max(59),
                    hour: number().required().max(12),
                    meridiem: string().required().custom(MiscValidations.meridiem)
                }),
                end_date: object().required().keys({
                    month: number().required(),
                    day: number().required(),
                    year: number().required()
                }).custom(MiscValidations.date),
                end_time: object().required().keys({
                    minute: number().required().max(59),
                    hour: number().required().max(12),
                    meridiem: string().required().custom(MiscValidations.meridiem)
                }),
                participants: array().optional().items(object().keys({
                    _id: string().required().custom(MiscValidations.object_id),
                    required: boolean().required()
                }))
            }),
            session_token: string().required()
        })
    };
    public static update_event: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            event: object().required().keys({
                _id: string().required().custom(MiscValidations.object_id),
                name: string().optional().custom(MiscValidations.event_name),
                start_date: object().optional().keys({
                    month: number().required(),
                    day: number().required(),
                    year: number().required()
                }).custom(MiscValidations.date),
                start_time: object().optional().keys({
                    minute: number().required().max(59),
                    hour: number().required().max(12),
                    meridiem: string().required().custom(MiscValidations.meridiem)
                }),
                end_date: object().optional().keys({
                    month: number().required(),
                    day: number().required(),
                    year: number().required()
                }).custom(MiscValidations.date),
                end_time: object().optional().keys({
                    minute: number().required().max(59),
                    hour: number().required().max(12),
                    meridiem: string().required().custom(MiscValidations.meridiem)
                }),
                participants: array().optional().items(object().keys({
                    _id: string().required().custom(MiscValidations.object_id),
                    required: boolean().required()
                })),
                join_requests: array().optional().items(string().optional().custom(MiscValidations.object_id))
            }),
            session_token: string().required()
        })
    };
    public static delete_event: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            user_id: string().required().custom(MiscValidations.object_id),
            event_id: string().required().custom(MiscValidations.object_id),
            session_token: string().required()
        })
    };
    public static update_participants: {
        body: ObjectSchema<any>;
    } = {
        body: object().required().keys({
            action: string().required().custom((value: string, helpers: CustomHelpers): 'invite' | 'mark' | 'remove' | ErrorReport => {
                if (value != 'invite' && value != 'mark' && value != 'remove') return helpers.message({ custom: 'action must either be invite, mark or remove' });
                return value;
            }),
            user_id: string().required().custom(MiscValidations.object_id),
            event_id: string().required().custom(MiscValidations.object_id),
            participants: array().required().items(object().keys({
                user_id: string().required().custom(MiscValidations.object_id),
                required: boolean().optional()
            })),
            session_token: string().required()
        })
    };
};

export { AuthValidations }