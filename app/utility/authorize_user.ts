import { generate_token } from './generate_token';
import { ObjectId } from '../database/definitions';
import { app } from '..';

export const authorize_user = (_id: ObjectId): string => {
    const token = generate_token();
    app.current_sessions.push({ user_id: _id, token: token, expiry: new Date().getTime() + 900000 }); // tokens last for 15 minutes
    return token;
}