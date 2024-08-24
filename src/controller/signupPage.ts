import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';
import mailer from '../config/mailer';
import { renderFile } from 'ejs';
import path from 'path';

export async function renderSignup(
    req: Request,
    res: Response,
    _next: NextFunction,
    renderOptions: {
        username?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        password?: string;
        confirm_password?: string;
    } = {},
): Promise<void> {
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const errorMessage = req.flash('error');
    res.render('signup', {
        csrfToken: res.locals.csrfToken,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirm_password: '',
        ...renderOptions,
    });
}

export async function signup(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const {
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        confirm_password,
    } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        req.flash('error', 'Valid email is required!');
        renderSignup(req, res, next, req.body);
        return;
    }

    if (await userModel.getUserByUsername(username)) {
        req.flash('error', 'Username is already taken!');
        renderSignup(req, res, next, req.body);
        return;
    }
    if (await userModel.getUserByEmail(email)) {
        req.flash('error', 'Email is already taken!');
        renderSignup(req, res, next, req.body);
        return;
    }
    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match!');
        renderSignup(req, res, next, req.body);
        return;
    }

    await userModel.createUser(
        username,
        firstName,
        lastName,
        email,
        password,
        username,
    );

    // Do not await the mailer
    mailer.sendMail({
        to: req.body.email,
        from: 'noreply@cryptospace.dev',
        subject: 'Registration for Daily Dash is complete!',
        html: await renderFile(path.resolve('views', 'emails', 'signup.ejs'), {
            username,
            firstName,
            lastName,
        }),
    });

    req.flash('info', 'Registration successful.');
    res.redirect('/login');
}
