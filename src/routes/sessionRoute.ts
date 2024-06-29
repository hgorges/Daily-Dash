import express, { NextFunction, Response } from 'express';
import {
    checkAuthentication,
    loginUser,
    logoutUser,
} from '../middleware/authMiddleware';
import { AuthRequest, castPromiseToVoid } from '../utils/utils';

const sessionRouter = express.Router();

sessionRouter.use((req, _res, next) => {
    console.log(`${req.method} ${req.url} called`);
    next();
});

sessionRouter.get('/login', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction
) => {
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    res.render('login');
}) as express.RequestHandler);

sessionRouter.post('/login', async (req, res) => {
    await loginUser(req as AuthRequest, res);
});

sessionRouter.get(
    '/logout',
    castPromiseToVoid(logoutUser) as express.RequestHandler
);

sessionRouter.use(
    castPromiseToVoid(checkAuthentication) as express.RequestHandler
);

export default sessionRouter;
