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
import { renderAdminPage } from '../controller/admin';
import { renderNotFoundPage } from '../controller/notFound';
import validateEmptyBody from '../validators/validateEmptyBody';
import validateSettings from '../validators/validateSettings';

const userRouter = express.Router();

userRouter.get('/', renderDashboardPage);

userRouter.get('/admin', renderAdminPage);

userRouter.post('/switch-location', validateEmptyBody, switchLocation);

userRouter.patch('/todos/:id/complete', validateEmptyBody, completeTodo);

userRouter.patch('/todos/:id/postpone', validateEmptyBody, postponeTodo);

userRouter.get('/google-auth', cors(), redirectFromGoogle);

userRouter.post('/google', validateEmptyBody, cors(), redirectToGoogle);

userRouter.get('/settings', renderSettingsPage);

userRouter.post('/settings', validateSettings, saveSettings);

userRouter.get('/not-found', renderNotFoundPage);

// Middleware to redirect to /not-found
userRouter.use((req, res) => {
    console.log(`Redirecting from ${req.url} to /not-found`);
    res.redirect('/not-found');
});

export default userRouter;
