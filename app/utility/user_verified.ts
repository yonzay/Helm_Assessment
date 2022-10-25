import { ObjectId } from 'mongodb';
import { app } from '..';

export const user_verified = (user_id: ObjectId, session_token: string): boolean => {
    if (app.current_sessions.find(session => user_id.equals(session.user_id) && session_token == session.token)) return true;
    return false;
}