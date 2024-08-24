import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';
import mailer from '../config/mailer';
import { renderFile } from 'ejs';
import path from 'path';

export async function renderPasswordReset(
    req: Request,
    res: Response,
    _next: NextFunction,
    renderOptions: { email?: string } = {},
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
        email: '',
        ...renderOptions,
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
