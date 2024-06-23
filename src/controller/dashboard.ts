import { NextFunction, Response } from 'express';
import apodModel from '../models/apodModel';
import newsModel from '../models/newsModel';
import weatherModel from '../models/weatherModel';
import { AuthRequest } from '../utils/utils';

export const dashboardController = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction
): Promise<void> => {
    res.status(200).render('dashboard', {
        path: '/',
        ...(await newsModel.getNewsData()),
        ...(await weatherModel.getWeatherData(req.session.username)),
        ...(await apodModel.getApodData()),
    });
};
