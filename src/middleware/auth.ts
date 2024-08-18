import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';
import path from 'path';
import { renderFile } from 'ejs';
import mailer from '../config/mailer';
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

export async function renderLogin(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    // TODO delete password_reset_token and password_reset_token_expiration if logged in properly without resetting password
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');
    res.render('login', {
        csrfToken: res.locals.csrfToken,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}

export async function login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (username.toLowerCase() === 'system') {
        res.redirect('/login');
        return;
    }

    const user = await userModel.getUserForLogin(username, password);
    if (!user) {
        req.flash('error', 'Invalid username or password!');
        res.redirect('/login');
        return;
    }

    req.session.username = user.username;
    req.session.isAdmin = user.is_admin;
    req.session.isAuthenticated = true;
    req.session.isHome = true;
    req.session.save();
    res.redirect('/');
}

export async function changePassword(
    req: Request,
    res: Response,
): Promise<void> {
    const { password, confirm_password, userId } = req.body;
    const { passwordResetToken } = req.params;

    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match!');
        res.redirect(`/password-change/${passwordResetToken}`);
        return;
    }

    const user =
        await userModel.getUserByValidPasswordResetToken(passwordResetToken);
    if (!user || user.user_id !== userId) {
        req.flash('error', 'Invalid password reset token!');
        res.redirect('/login');
        return;
    }

    await userModel.changePassword(user.username, password);
    // Do not await the mailer
    mailer.sendMail({
        to: user.email,
        from: 'noreply@cryptospace.dev',
        subject: 'Password change for Daily Dash',
        html: await renderFile(
            path.resolve('views', 'emails', 'password-change.ejs'),
            {
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
            },
        ),
    });

    req.flash('info', 'Password successfully changed!');
    res.redirect('/login');
}

export async function renderPasswordReset(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');

    res.render('password-reset', {
        csrfToken: res.locals.csrfToken,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}

export async function renderPasswordChange(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    const user = await userModel.getUserByValidPasswordResetToken(
        req.params.passwordResetToken,
    );
    if (!user) {
        req.flash('error', 'Invalid password reset token!');
        res.redirect('/login');
        return;
    }

    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');

    res.render('password-change', {
        csrfToken: res.locals.csrfToken,
        userId: user.user_id,
        passwordResetToken: req.params.passwordResetToken,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}

export async function createPasswordResetToken(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    const { email } = req.body;
    const user = await userModel.getUserByEmail(email);
    if (user) {
        const randomUuid = crypto.randomUUID();
        await userModel.setPasswordResetTokenForUser(user.username, randomUuid);
        // Do not await the mailer
        mailer.sendMail({
            to: email,
            from: 'noreply@cryptospace.dev',
            subject: 'Password reset for Daily Dash',
            html: await renderFile(
                path.resolve('views', 'emails', 'password-reset.ejs'),
                {
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    resetLink: `https://cryptospace.dev/password-change/${randomUuid}`,
                },
            ),
        });
    }

    req.flash('info', 'Email sent if account exists.');
    res.redirect('/login');
}

export async function renderSignup(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const errorMessage = req.flash('error');
    res.render('signup', {
        csrfToken: res.locals.csrfToken,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}

export async function signup(req: Request, res: Response): Promise<void> {
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
        res.redirect('/signup');
        return;
    }

    if (await userModel.getUserByUsername(username)) {
        req.flash('error', 'Username is already taken!');
        res.redirect('/signup');
        return;
    }
    if (await userModel.getUserByEmail(email)) {
        req.flash('error', 'Email is already taken!');
        res.redirect('/signup');
        return;
    }
    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match!');
        res.redirect('/signup');
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
