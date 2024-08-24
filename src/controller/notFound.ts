import { Request, Response } from 'express-serve-static-core';

export function renderNotFoundPage(_req: Request, res: Response): void {
    res.status(404).render('not-found', {
        path: '/not-found',
    });
}
