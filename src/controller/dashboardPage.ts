import apodModel from '../models/apodModel';
import calendarModel from '../models/calendarModel';
import newsModel from '../models/newsModel';
import todoModel from '../models/todoModel';
import trafficModel from '../models/trafficModel';
import weatherModel from '../models/weatherModel';
import { NextFunction, Request, Response } from 'express-serve-static-core';

export async function renderDashboardPage(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    res.status(200).render('dashboard', {
        path: '/',
        csrfToken: res.locals.csrfToken,
        isAdmin: req.session.isAdmin,
        ...(await newsModel.getNewsData()),
        weatherData: await weatherModel.getWeatherData(
            req.session.username,
            req.session.isHome,
        ),
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
}

export function switchLocation(
    req: Request,
    res: Response,
    _next: NextFunction,
): void {
    req.session.isHome = !req.session.isHome;
    res.status(200).send();
}

export async function completeTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    await todoModel.completeTodo(req.session.username, req.params.id);
    res.status(200).send();
}

export async function postponeTodo(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    await todoModel.postponeTodo(req.session.username, req.params.id);
    res.status(200).send();
}
