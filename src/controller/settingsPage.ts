import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';

export async function renderSettingsPage(
    req: Request,
    res: Response,
): Promise<void> {
    const user = await userModel.getUserByUsername(req.session.username);
    res.render('settings', {
        path: '/settings',
        user,
        csrfToken: res.locals.csrfToken,
        isAdmin: req.session.isAdmin,
    });
}

export async function saveSettings(
    req: Request,
    res: Response,
    _next: NextFunction,
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
