import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';

export async function renderSettingsPage(
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
        home_latitude?: string;
        home_longitude?: string;
        work_latitude?: string;
        work_longitude?: string;
        calendars?: string;
        locale?: string;
        time_zone?: string;
    } = {},
): Promise<void> {
    const user = await userModel.getUserByUsername(req.session.username);

    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');

    res.render('settings', {
        path: '/settings',
        csrfToken: res.locals.csrfToken,
        isAdmin: req.session.isAdmin,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
        ...user,
        home_latitude: user?.home_gps.x,
        home_longitude: user?.home_gps.y,
        work_latitude: user?.work_gps.x,
        work_longitude: user?.work_gps.y,
        password: '',
        confirm_password: '',
        ...renderOptions,
    });
}

export async function saveSettings(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const {
        username,
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        home_latitude,
        home_longitude,
        work_latitude,
        work_longitude,
        calendars,
        locale,
        time_zone,
    } = req.body;

    if (password !== confirm_password) {
        req.flash('error', 'Passwords do not match!');
        renderSettingsPage(req, res, next, req.body);
        return;
    }

    if (password == null || password.length <= 7) {
        req.flash('error', 'Password must be at least 8 characters long!');
        renderSettingsPage(req, res, next, req.body);
        return;
    }

    await userModel.updateUser(
        req.session.username,
        username,
        first_name,
        last_name,
        password,
        confirm_password,
    );

    req.session.username = username;
    req.session.save();

    await userModel.updateUserData(
        req.session.username,
        email,
        {
            x: home_latitude,
            y: home_longitude,
        },
        { x: work_latitude, y: work_longitude },
        calendars,
        locale,
        time_zone,
    );

    res.redirect('/');
}
