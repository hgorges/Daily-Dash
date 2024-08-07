import express, { NextFunction, Response } from 'express';
import {
    adminController,
    dashboardController,
} from '../controller/pagesController';
import { getAuthUrl, redirectFromGoogle } from '../controller/google-auth';
import todoModel from '../models/todoModel';
import { AuthRequest, castPromiseToVoid } from '../utils/utils';
import { settingsController } from '../controller/settings';
import userModel from '../models/userModel';
import cors from 'cors';

const userRouter = express.Router();

userRouter.get('/', dashboardController as unknown as express.RequestHandler);

userRouter.get('/admin', adminController as unknown as express.RequestHandler);

userRouter.post('/switch-location', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    req.session.isHome = !req.session.isHome;
    res.status(200).send();
}) as express.RequestHandler);

userRouter.patch('/todos/:id/complete', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    todoModel.completeTodo(req.session.username, req.params.id);
    res.status(200).send();
}) as express.RequestHandler);

userRouter.patch('/todos/:id/postpone', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    todoModel.postponeTodo(req.session.username, req.params.id);
    res.status(200).send();
}) as express.RequestHandler);

userRouter.get(
    '/google-auth',
    // TODO add options for google
    cors({}),
    castPromiseToVoid(redirectFromGoogle) as express.RequestHandler,
);

userRouter.post(
    '/google',
    // TODO add options for google
    cors({}),
    castPromiseToVoid(async (_req, res: Response, _next) => {
        res.redirect(getAuthUrl());
    }),
);

userRouter.get(
    '/settings',
    castPromiseToVoid(async (req: AuthRequest, res, _next) => {
        const user = await userModel.getUserByUsername(req.session.username);
        res.render('settings', {
            path: '/settings',
            user,
            csrfToken: res.locals.csrfToken,
            isAdmin: req.session.isAdmin,
        });
    }) as express.RequestHandler,
);

userRouter.post(
    '/settings',
    castPromiseToVoid(settingsController) as express.RequestHandler,
);

userRouter.get('/not-found', (_req, res) => {
    res.status(404).render('not-found', {
        path: '/not-found',
    });
});

userRouter.use((req, res) => {
    console.log(`Redirecting from ${req.url} to /not-found`);
    res.redirect('/not-found');
});

export default userRouter;
