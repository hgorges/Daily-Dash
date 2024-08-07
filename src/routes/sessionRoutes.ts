import express, { NextFunction, Response } from 'express';
import {
    changePassword,
    checkAuthentication,
    createUser,
    loginUser,
    logoutUser,
    sendResetPasswordEmail,
} from '../middleware/authMiddleware';
import { AuthRequest, castPromiseToVoid } from '../utils/utils';
import userModel from '../models/userModel';

const sessionRouter = express.Router();

sessionRouter.use((req, _res, next) => {
    console.log(`${req.method} ${req.url} called`);
    next();
});

sessionRouter.get('/password-reset', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');
    res.render('password-reset', {
        csrfToken: res.locals.csrfToken,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}) as express.RequestHandler);

sessionRouter.post(
    '/password-reset',
    castPromiseToVoid(sendResetPasswordEmail) as express.RequestHandler,
);

sessionRouter.get(
    '/password-change/:passwordResetToken',
    castPromiseToVoid(
        async (req: AuthRequest, res: Response, _next: NextFunction) => {
            const user = await userModel.getUserByValidPasswordResetToken(
                req.params.passwordResetToken,
            );
            if (!user) {
                req.flash('error', 'Invalid password reset token!');
                res.redirect('/login');
                return;
            }

            const infoMessage = req.flash('info');
            const errorMessage = req.flash('error');
            res.render('password-change', {
                csrfToken: res.locals.csrfToken,
                userId: user.user_id,
                passwordResetToken: req.params.passwordResetToken,
                infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
                errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
            });
        },
    ) as express.RequestHandler,
);

sessionRouter.post('/password-change/:passwordResetToken', async (req, res) => {
    await changePassword(req, res);
});

sessionRouter.get('/login', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    // TODO delete password_reset_token and password_reset_token_expiration if logged in properly without resetting password
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const infoMessage = req.flash('info');
    const errorMessage = req.flash('error');
    res.render('login', {
        csrfToken: res.locals.csrfToken,
        infoMessage: infoMessage.length > 0 ? infoMessage[0] : null,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}) as express.RequestHandler);

sessionRouter.post('/login', async (req, res) => {
    await loginUser(req as AuthRequest, res);
});

sessionRouter.get('/signup', ((
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    if (req.session.isAuthenticated) {
        res.redirect('/');
        return;
    }
    const errorMessage = req.flash('error');
    res.render('signup', {
        csrfToken: res.locals.csrfToken,
        errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
    });
}) as express.RequestHandler);

sessionRouter.post('/signup', async (req, res) => {
    await createUser(req as AuthRequest, res);
});

sessionRouter.get(
    '/logout',
    castPromiseToVoid(logoutUser) as express.RequestHandler,
);

// TODO
// router.use(...handler) for multiple handlers
sessionRouter.use(
    castPromiseToVoid(checkAuthentication) as express.RequestHandler,
);

export default sessionRouter;
