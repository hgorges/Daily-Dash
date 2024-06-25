export function castPromiseToVoid<Args extends unknown[]>(
    fn: (...args: Args) => Promise<unknown>
): (...args: Args) => void {
    return (...args) => {
        void fn(...args);
    };
}

import { Request } from 'express';
import { Session } from 'express-session';
import { User } from '../models/userModel';

export type AuthSession = Session & {
    username: string;
    isAuthenticated: boolean;
    isHome: boolean;
    googleCalendarAccessToken?: string;
};

export type AuthRequest = Request & {
    session?: AuthSession;
    user?: User;
};
