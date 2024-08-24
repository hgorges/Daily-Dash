import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';
import mailer from '../config/mailer';
import { renderFile } from 'ejs';
import path from 'path';

export async function renderPasswordChange(
    req: Request,
    res: Response,
    _next: NextFunction,
    renderOptions: {
        password?: string;
        confirm_password?: string;
    } = {},
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
        password: '',
        confirm_password: '',
        ...renderOptions,
    });
}

export async function changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { password, confirm_password, userId } = req.body;
    const { passwordResetToken } = req.params;

    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match!');
        req.params.passwordResetToken = passwordResetToken;
        renderPasswordChange(req, res, next, req.body);
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
