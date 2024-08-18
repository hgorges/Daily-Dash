import { doubleCsrf } from 'csrf-csrf';
import { NextFunction, Request, Response } from 'express-serve-static-core';

export const { doubleCsrfProtection, generateToken } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET as string,
    getTokenFromRequest: (req) => {
        if (req.path === '/login') {
            return req.body._csrf;
        } else {
            return req.cookies['__daily-dash.x-csrf-token'].split('|')[0];
        }
    },
    cookieName: '__daily-dash.x-csrf-token',
    cookieOptions: {
        secure: true,
        path: '/',
        sameSite: 'strict',
    },
    ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export function setCsrfToken(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    res.locals.csrfToken = generateToken(req, res, true);
    next();
}
