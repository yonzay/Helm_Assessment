import morgan from 'morgan';
import { Request, Response } from 'express';
import { app } from '..';

morgan.token('message', (req: Request, res: Response) => res.locals.error_message || '');

class Morgan {
    private static get_ip_format = (): string => {
        return process.env.node_env === 'prod' ? ':remote-addr - ' : '';
    }
    private static success_response_format: string = `${ Morgan.get_ip_format() }:method :url :status - :response-time ms`;
    private static error_response_format: string = `${ Morgan.get_ip_format() }:method :url :status - :response-time ms - message: :message`;
    public static success_handler = morgan(Morgan.success_response_format, {
        skip: (req, res) => res.statusCode >= 400,
        stream: { write: message => app.logger.instance.info(message.trim()) }
    });
    public static error_handler = morgan(Morgan.error_response_format, {
        skip: (req, res) => res.statusCode < 400,
        stream: { write: message => app.logger.instance.error(message.trim()) }
    });
};

export { Morgan }