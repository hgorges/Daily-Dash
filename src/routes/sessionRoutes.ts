import express from 'express';
import {
    changePassword,
    checkAuthentication,
    createPasswordResetToken,
    login,
    logoutUser,
    renderLogin,
    renderPasswordChange,
    renderPasswordReset,
    renderSignup,
    signup,
} from '../middleware/auth';

const sessionRouter = express.Router();

// Middleware to log requests
sessionRouter.use((req, _res, next) => {
    console.log(`${req.method} ${req.url} called`);
    next();
});

sessionRouter.get('/password-reset', renderPasswordReset);

sessionRouter.post('/password-reset', createPasswordResetToken);

sessionRouter.get('/password-change/:passwordResetToken', renderPasswordChange);

sessionRouter.post('/password-change/:passwordResetToken', changePassword);

sessionRouter.get('/login', renderLogin);

sessionRouter.post('/login', login);

sessionRouter.get('/signup', renderSignup);

sessionRouter.post('/signup', signup);

sessionRouter.get('/logout', logoutUser);

sessionRouter.use(checkAuthentication);

export default sessionRouter;
