import { NextFunction, Request, Response } from 'express-serve-static-core';

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
        });
    } else {
        res.redirect('/');
    }
}
