import { NextFunction, Response } from 'express';
import apodModel from '../models/apodModel';
import calendarModel from '../models/calendarModel';
import newsModel from '../models/newsModel';
import todoModel from '../models/todoModel';
import trafficModel from '../models/trafficModel';
import weatherModel from '../models/weatherModel';
import { AuthRequest } from '../utils/utils';

export const dashboardController = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
): Promise<void> => {
    res.status(200).render('dashboard', {
        path: '/',
        ...(await newsModel.getNewsData()),
        ...(await weatherModel.getWeatherData(
            req.session.username,
            req.session.isHome,
        )),
        isHome: req.session.isHome,
        trafficData: await trafficModel.getTrafficData(
            req.session.isHome,
            req.user,
        ),
        todos: await todoModel.getDueTodosForToday(req.session.username),
        events: await calendarModel.getCalendarEvents(req),
        googleCalendarAccessToken: req.session.googleCalendarAccessToken,
        ...(await apodModel.getApodData()),
    });
};
