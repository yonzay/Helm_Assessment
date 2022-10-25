import { dotenv_json } from './utility/dotenv_json';
dotenv_json({});

import { App } from './app';
import { Routes } from './routes/v1/routes';
import { Morgan } from './utility/morgan';
import { RateLimiter } from './middleware/rate_limiter';
import { ApiError } from './utility/api_error';
import { ErrorMiddleware } from './middleware/error_middleware';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import xss from 'xss-clean';
import express_mongo_sanitize from 'express-mongo-sanitize';
import compression from 'compression';
import cors from 'cors';
import http_status from 'http-status';

const app: App = new App([
    process.env.node_env !== 'test' ? [Morgan.success_handler, 'Middleware'] : [(n: any) => void n, 'Skip'],
    process.env.node_env !== 'test' ? [Morgan.error_handler, 'Middleware'] : [(n: any) => void n, 'Skip'],
    [helmet(), 'Middleware'], 
    [express.json(), 'Middleware'],
    [express.urlencoded({ extended: true }), 'Middleware'],
    [xss(), 'Middleware'],
    [express_mongo_sanitize(), 'Middleware'],
    [compression(), 'Middleware'],
    [cors(), 'Middleware'],
    [['*', cors()], 'Option'],
    process.env.node_env === 'prod' ? [['/api/v1/auth', RateLimiter.auth_limiter], 'Route'] : [[(n: any) => void n], 'Skip'],
    [['/api/v1', new Routes().router], 'Route'],
    [(req: Request, res: Response, next: NextFunction) => next(new ApiError(http_status.NOT_FOUND, 'Not Found')), 'Middleware'],
    [ErrorMiddleware.error_converter, 'Middleware'],
    [ErrorMiddleware.error_handler, 'Middleware']
]);

export { app }