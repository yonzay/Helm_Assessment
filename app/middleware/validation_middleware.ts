import { compile, ObjectSchema } from 'joi';
import { pick } from '../utility/pick';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utility/api_error';
import http_status from 'http-status';

class ValidationMiddleware {
    public static validate = (schema: {
        body: ObjectSchema<any>;
    }) => (req: Request, res: Response, next: NextFunction) => {
        const valid_schema = pick(schema, ['params', 'query', 'body']);
        const { value, error } = compile(valid_schema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(pick(req, Object.keys(valid_schema)));
        if (error) return next(new ApiError(http_status.BAD_REQUEST, error.details.map(detail => detail.message).join(', ')));
        Object.assign(req, value);
        return next();
    }
};

export { ValidationMiddleware }