import express from 'express';
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

sessionRouter.get('/login', (_req, res) => {
    res.render('login');
});

sessionRouter.post('/login', (req, res) => {
    loginUser(req as AuthRequest, res);
});

sessionRouter.get(
    '/logout',
    castPromiseToVoid(logoutUser) as express.RequestHandler
);

sessionRouter.use(
    castPromiseToVoid(checkAuthentication) as express.RequestHandler
);

export default sessionRouter;
