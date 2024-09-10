import { NextFunction, Request, Response } from 'express-serve-static-core';
import userModel from '../models/userModel';

export async function renderAdminPage(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    if (req.session.isAdmin) {
        res.status(200).render('admin', {
            path: '/admin',
            csrfToken: res.locals.csrfToken,
            isAdmin: req.session.isAdmin,
            approvedUsers: (
                (await userModel.getUsersByApprovalState(true)) ?? []
            ).map((user) => {
                return {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                };
            }),
            lockedUsers: (
                (await userModel.getUsersByApprovalState(false)) ?? []
            ).map((user) => {
                return {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                };
            }),
        });
    } else {
        res.redirect('/');
    }
}

export async function approveUser(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    if (req.session.isAdmin) {
        await userModel.updateUserApprovalStatus(req.params.id, true);
        res.status(200).send();
    } else {
        res.redirect('/');
    }
}

export async function lockUser(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    if (req.session.isAdmin) {
        await userModel.updateUserApprovalStatus(req.params.id, false);
        res.status(200).send();
    } else {
        res.redirect('/');
    }
}
