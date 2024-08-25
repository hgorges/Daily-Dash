import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';
import { ValidationError } from '../utils/utils';

export async function renderLogin(
    req: Request,
    res: Response,
    _next: NextFunction,
    renderOptions: {
        statusCode?: number;
        errors?: ValidationError[];
        username?: string;
        password?: string;
    } = {},
): Promise<void> {
    // TODO delete password_reset_token and password_reset_token_expiration if logged in properly without resetting password
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');
    res.status(renderOptions.statusCode ?? 200).render('login', {
        csrfToken: res.locals.csrfToken,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        username: '',
        password: '',
        errors: [],
        ...renderOptions,
    });
}

export async function login(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { username, password } = req.body;

    if (username.toLowerCase() === 'system') {
        renderLogin(req, res, next, { statusCode: 422, ...req.body });
        return;
    }

    const user = await userModel
        .getUserForLogin(username, password)
        .catch((error) => {
            next(new Error(error));
        });
    if (!user) {
        req.flash('error', 'Invalid username or password!');
        renderLogin(req, res, next, {
            statusCode: 422,
            errors: [
                {
                    param: 'username',
                    message: 'Invalid username or password!',
                    value: username,
                },
                {
                    param: 'password',
                    message: 'Invalid username or password!',
                    value: password,
                },
            ],
            ...req.body,
        });
        return;
    }

    req.session.username = user.username;
    req.session.isAdmin = user.is_admin;
    req.session.isAuthenticated = true;
    req.session.isHome = true;
    req.session.save();
    res.redirect('/');
}
