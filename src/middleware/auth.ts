import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';
import assert from 'node:assert';

export async function checkAuthentication(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (req.session.isAuthenticated) {
        const user = await userModel.getUserByUsername(req.session.username);
        assert(user, 'User not found in database');

        req.user = user;
        next();
    } else {
        res.redirect('/login');
    }
}

export async function logoutUser(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.clearCookie('__daily-dash.x-csrf-token');
        res.redirect('/login');
    });
}
