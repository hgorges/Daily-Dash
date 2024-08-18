import path from 'path';
import { Session } from 'express-session';

export type AuthSession = Session & {
    username: string;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isHome: boolean;
    googleCalendarAccessToken?: string;
};

export const fileRoot = path.join(__dirname, '..', '..');
