import { NextFunction, Response } from 'express';
import { AuthRequest } from '../utils/utils';
import userModel from '../models/userModel';

export const settingsController = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
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
};
