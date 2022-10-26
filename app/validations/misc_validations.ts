import { CustomHelpers, ErrorReport, ObjectSchema } from '@hapi/joi';
import * as Joi from '@hapi/joi';

class MiscValidations {
    public static object_id = (value: string, helpers: CustomHelpers): string | ErrorReport => {
        if (!value.match(/^[0-9a-fA-F]{24}$/)) return helpers.message({ custom: 'value must be a valid MongoDB ObjectId' });
        return value;
    }
    public static configuration: ObjectSchema<any> = Joi.object().keys({
        node_env: Joi.string().required().custom((value: string, helpers: CustomHelpers): 'prod' | 'dev' | 'test' | ErrorReport => {
            if (value != 'prod' && value != 'dev' && value != 'test') return helpers.message({ custom: 'node_env must either be prod, dev, or test' });
            return value;
        }),
        hostname: Joi.string().required(),
        port: Joi.number().required().max(65535),
        mongodb_url: Joi.string().required(),
        database_name: Joi.string().required(),
        admin_session_token: Joi.string().required()
    }).unknown();
    public static first_name = (value: string, helpers: CustomHelpers): string | ErrorReport => {
        if (value.length <= 0) return helpers.message({ custom: 'first name can\'t be empty' });
        if (value.length > 25) return helpers.message({ custom: 'first name must be less than 25 characters' });
        if (value.match(/\W/) || value.match(/[0-9]/)) return helpers.message({ custom: 'first name cannot contain symbols' });
        return value;
    }
    public static last_name = (value: string, helpers: CustomHelpers): string | ErrorReport => {
        if (value.length <= 0) return helpers.message({ custom: 'last name can\'t be empty' });
        if (value.length > 25) return helpers.message({ custom: 'last name must be less than 25 characters' });
        if (value.match(/\W/) || value.match(/[0-9]/)) return helpers.message({ custom: 'last name cannot contain symbols' });
        return value;
    }
    public static password = (value: string, helpers: CustomHelpers): string | ErrorReport => {
        if (value.length < 8) return helpers.message({ custom: 'password must be at least 8 characters' });
        if (value.length > 25) return helpers.message({ custom: 'password must be less than 25 characters' });
        if (!(value.match(/\W/) || value.match(/[0-9]/) && value.match(/[A-Za-z]/))) return helpers.message({ custom: 'password must contain at least 1 letter and 1 symbol' });
        return value;
    }
    public static username = (value: string, helpers: CustomHelpers): string | ErrorReport => {
        if (value.length <= 0) return helpers.message({ custom: 'username can\'t be empty' });
        if (value.length > 25) return helpers.message({ custom: 'username must be less than 25 characters' });
        if (value.match(/\W/)) return helpers.message({ custom: 'username cannot contain non-digit symbols' });
        return value;
    }
    public static date = (value: {
        month: number;
        day: number;
        year: number;
    }, helpers: CustomHelpers): {
        month: number;
        day: number;
        year: number;
    } | ErrorReport => {
        if (isNaN(new Date(`${ value.month }-${ value.day }-${ value.year }`).getTime())) return helpers.message({ custom: 'please use a valid date' });
        return value;
    }
    public static meridiem = (value: string, helpers: CustomHelpers): 'AM' | 'PM' | ErrorReport => {
        if (value != 'AM' && value != 'PM') return helpers.message({ custom: 'meridiem must either be AM or PM' });
        return value;
    }
    public static event_name = (value: string, helpers: CustomHelpers): string | ErrorReport => {
        if (value.length < 2) return helpers.message({ custom: 'event name must be atleast 2 characters' });
        if (value.length > 25) return helpers.message({ custom: 'event name must be less than 25 characters' });
        return value;
    }
};

export { MiscValidations }