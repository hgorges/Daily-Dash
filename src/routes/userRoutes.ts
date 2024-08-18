import express from 'express';
import {
    redirectFromGoogle,
    redirectToGoogle,
} from '../middleware/google-auth';
import { renderSettingsPage, saveSettings } from '../controller/settingsPage';
import cors from 'cors';
import {
    completeTodo,
    postponeTodo,
    renderDashboardPage,
    switchLocation,
} from '../controller/dashboardPage';
import { renderAdminPage } from '../controller/adminPage';
import { renderNotFoundPage } from '../controller/notFoundPage';

const userRouter = express.Router();

userRouter.get('/', renderDashboardPage);

userRouter.get('/admin', renderAdminPage);

userRouter.post('/switch-location', switchLocation);

userRouter.patch('/todos/:id/complete', completeTodo);

userRouter.patch('/todos/:id/postpone', postponeTodo);

userRouter.get('/google-auth', cors(), redirectFromGoogle);

userRouter.post('/google', cors(), redirectToGoogle);

userRouter.get('/settings', renderSettingsPage);

userRouter.post('/settings', saveSettings);

userRouter.get('/not-found', renderNotFoundPage);

// Middleware to redirect to /not-found
userRouter.use((req, res) => {
    console.log(`Redirecting from ${req.url} to /not-found`);
    res.redirect('/not-found');
});

export default userRouter;
