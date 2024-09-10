import express from 'express';
import {
    redirectFromGoogle,
    redirectToGoogle,
} from '../middleware/google-auth';
import { renderSettingsPage, saveSettings } from '../controller/settings';
import cors from 'cors';
import {
    completeTodo,
    postponeTodo,
    renderDashboardPage,
    switchLocation,
} from '../controller/dashboard';
import { approveUser, lockUser, renderAdminPage } from '../controller/admin';
import validateEmptyBody from '../validators/validateEmptyBody';
import validateSettings from '../validators/validateSettings';
import { renderNotFoundPage } from '../controller/notFound';
import { renderErrorPage } from '../controller/error';
import { logger } from '../config/logger';

const userRouter = express.Router();

userRouter.get('/', renderDashboardPage);

// TODO add route for daily briefing pdf to download and/or mail to user
// utilize fs.createReadStream(path).pipe(res) to download file (and mail?)

userRouter.get('/admin', renderAdminPage);

userRouter.post('/admin/approve-user/:id', approveUser);

userRouter.post('/admin/lock-user/:id', lockUser);

userRouter.post('/switch-location', validateEmptyBody, switchLocation);

userRouter.patch('/todos/:id/complete', validateEmptyBody, completeTodo);

userRouter.patch('/todos/:id/postpone', validateEmptyBody, postponeTodo);

userRouter.get('/google-auth', cors(), redirectFromGoogle);

userRouter.post('/google', validateEmptyBody, cors(), redirectToGoogle);

userRouter.get('/settings', renderSettingsPage);

userRouter.post('/settings', validateSettings, saveSettings);

userRouter.get('/not-found', renderNotFoundPage);

userRouter.get('/error', renderErrorPage);

// Middleware to redirect to /not-found
userRouter.use((req, res) => {
    logger.info(`Redirecting from ${req.url} to /not-found`);
    res.redirect('/not-found');
});

export default userRouter;
