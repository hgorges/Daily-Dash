import { NextFunction, Response } from 'express';
import userModel from '../models/userModel';
import { AuthRequest } from '../utils/utils';

export async function loginUser(
    req: AuthRequest,
    res: Response
): Promise<void> {
    const { username, password } = req.body;

    if (username.toLowerCase() === 'system') {
        res.redirect('/login');
        return;
    }

    const user = await userModel.getUserForLogin(username, password);
    if (!user) {
        res.redirect('/login');
        return;
    }

    req.session.username = user.username;
    req.session.isAuthenticated = true;
    res.redirect('/');
}

export async function logoutUser(
    req: AuthRequest,
    res: Response,
    _next: NextFunction
): Promise<void> {
    req.session.destroy(() => res.redirect('/login'));
}

export async function checkAuthentication(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (req.session.isAuthenticated) {
        req.user = await userModel.getUserByUsername(req.session.username);
        next();
    } else {
        res.redirect('/login');
    }
}
