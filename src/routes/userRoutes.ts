import express, { NextFunction, Response } from 'express';
import { dashboardController } from '../controller/dashboard';
import { getAuthUrl, redirectFromGoogle } from '../controller/google-auth';
import todoModel from '../models/todoModel';
import { AuthRequest, castPromiseToVoid } from '../utils/utils';

const router = express.Router();

router.get(
    '/',
    castPromiseToVoid(dashboardController) as express.RequestHandler,
);

router.post('/switch-location', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    req.session.isHome = !req.session.isHome;
    res.status(200).send();
}) as express.RequestHandler);

router.patch('/todos/:id/complete', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    todoModel.completeTodo(req.session.username, req.params.id);
    res.status(200).send();
}) as express.RequestHandler);

router.patch('/todos/:id/postpone', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    todoModel.postponeTodo(req.session.username, req.params.id);
    res.status(200).send();
}) as express.RequestHandler);

router.get(
    '/google-auth',
    castPromiseToVoid(redirectFromGoogle) as express.RequestHandler,
);

router.post(
    '/google',
    castPromiseToVoid(async (_req, res: Response, _next) => {
        res.redirect(getAuthUrl());
    }),
);

router.get('/not-found', (_req, res) => {
    res.status(404).render('not-found', {
        path: '/not-found',
    });
});

router.use((req, res) => {
    console.log(`Redirecting from ${req.url} to /not-found`);
    res.redirect('/not-found');
});

export default router;
