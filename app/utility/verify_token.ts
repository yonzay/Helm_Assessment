import { token_state } from './definitions';
import { app } from '..';

export const verify_token = (token: string): token_state => {
    if (token == app.admin_session_token) return { exists: true, is_admin: true };
    if (app.current_sessions.find(session => token == session.token)) return { exists: true, is_admin: false };
    return { exists: false, is_admin: false };
}