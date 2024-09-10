import express from 'express';
import { checkAuthentication, logoutUser } from '../middleware/auth';
import validateLogin from '../validators/validateLogin';
import validateSignup from '../validators/validateSignup';
import validatePasswordReset from '../validators/validatePasswordReset';
import validatePasswordChange from '../validators/validatePasswordChange';
import {
    changePassword,
    renderPasswordChange,
} from '../controller/passwordChange';
import {
    createPasswordResetToken,
    renderPasswordReset,
} from '../controller/passwordReset';
import { login, renderLogin } from '../controller/login';
import { renderSignup, signup } from '../controller/signup';
import { logger } from '../config/logger';

const sessionRouter = express.Router();

// Middleware to log requests
sessionRouter.use((req, _res, next) => {
    logger.info(`${req.method} ${req.url} called`);
    next();
});

sessionRouter.get('/password-reset', renderPasswordReset);

sessionRouter.post(
    '/password-reset',
    validatePasswordReset,
    createPasswordResetToken,
);

sessionRouter.get('/password-change/:passwordResetToken', renderPasswordChange);

sessionRouter.post(
    '/password-change/:passwordResetToken',
    validatePasswordChange,
    changePassword,
);

sessionRouter.get('/login', renderLogin);

sessionRouter.post('/login', validateLogin, login);

sessionRouter.get('/signup', renderSignup);

sessionRouter.post('/signup', validateSignup, signup);

sessionRouter.get('/logout', logoutUser);

sessionRouter.use(checkAuthentication);

export default sessionRouter;
