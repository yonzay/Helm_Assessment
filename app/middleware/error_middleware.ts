import { app } from '..';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utility/api_error';
import http_status from 'http-status';

class ErrorMiddleware {
    public static error_converter = (err: any, req: Request, res: Response, next: NextFunction): void => {
        let error = err;
        if (!(error instanceof ApiError)) {
            const status_code = error.statusCode || http_status.INTERNAL_SERVER_ERROR;
            error = new ApiError(status_code, error.message || http_status[status_code], false, err.stack);
        }
        next(error);
    }
    public static error_handler = (err: ApiError, req: Request, res: Response, next: NextFunction): void => {
        let { status_code, message } = err;
        if (process.env.node_env === 'prod' && !err.is_operational) {
            status_code = http_status.INTERNAL_SERVER_ERROR;
            message = http_status[http_status.INTERNAL_SERVER_ERROR] as string;
        }
        res.locals.error_message = err.message;
        if (process.env.node_env === 'dev') app.logger.instance.error(err);
        res.status(status_code).send({
            code: status_code,
            message,
            ...(process.env.node_env === 'dev' && { stack: err.stack })
        });
    }
};

export { ErrorMiddleware }