import { MongoClient, ChangeStream } from 'mongodb';
import { Collections, database_collections } from './definitions';
import { app } from '..';

class Database {
    public client: database_collections;
    private debug_listener: {
        users: ChangeStream<any>;
        events: ChangeStream<any>;
    };
    public already_exists = async (collection: 'users' | 'events', query: object): Promise<boolean> => {
        return !!await this.client[collection].findOne(query);
    }
    constructor(connection_uri: string, database_name: string) {
        new MongoClient(connection_uri).connect().then(result => {
            const database = result.db(database_name);
            this.client = {
                users: database.collection(Collections.users),
                events: database.collection(Collections.events)
            }
            app.logger.instance.info(`[database_name]: [${ database_name }] Successfully established a connection to the database`);
            if (process.env.node_env == 'dev' || process.env.node_env == 'test') this.debug_listener = {
                users: this.client.users.watch().on('change', result => {
                    app.logger.instance.info('New database action: ' + JSON.stringify(result));
                }),
                events: this.client.events.watch().on('change', result => {
                    app.logger.instance.info('New database action: ' + JSON.stringify(result));
                })
            }
        }).catch(e => {
            app.logger.instance.error(e);
            process.exit(1);
        });
    }
};

export { Database }