import express, { Express } from 'express';
import { Database } from './database/database';
import { ObjectId } from 'mongodb';
import { Logger } from './utility/logger';

type Extension = [any, 'Middleware' | 'Route' | 'Option' | 'Skip'];

class App {
    public logger: Logger = new Logger();
    public app_instance: Express = express();
    public database: Database = new Database(process.env.mongodb_url as string, process.env.database_name as string);
    public current_sessions: {
        user_id: ObjectId;
        token: string;
        expiry: number;
    }[] = [];
    private check_sessions: NodeJS.Timer = setInterval(() => {
        this.current_sessions.forEach(entry => {
            if (entry.expiry < Date.now()) {
                const index: number = this.current_sessions.indexOf(entry);
                if (index != -1) this.current_sessions.splice(index, 1);
            }
        });
    }, (60000 * 5));
    public admin_session_token: string = process.env.admin_session_token as string;
    constructor(extensions: Extension[]) {
        extensions.forEach(extension => {
            switch(extension[1]) {
                case 'Middleware':
                    this.app_instance.use(extension[0]);
                    break;
                case 'Route':
                    this.app_instance.use(extension[0][0], extension[0][1]);
                    break;
                case 'Option':
                    this.app_instance.options(extension[0][0], extension[0][1]);
                    break;
                case 'Skip':
                    break;
            }
        });
        this.app_instance.listen(process.env.port as unknown as number, process.env.hostname as string, () => {
            this.logger.instance.info(`[node_env]: [${ process.env.node_env }] Listening at http://${ process.env.hostname }:${ process.env.port }/`);
        });
    }
};

export { App }