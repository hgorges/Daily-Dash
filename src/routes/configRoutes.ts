import path from 'path';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import express from 'express';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import { doubleCsrfProtection, setCsrfToken } from '../config/csrf';
import session from '../config/session';
import { fileRoot } from '../utils/utils';
import compression from 'compression';
import { accessLogger } from '../config/logger';
import crypto from 'crypto';

const configRouter = express.Router();

configRouter.use(express.json());

configRouter.use(bodyParser.urlencoded({ extended: false }));

configRouter.use((_req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex');
    next();
});

configRouter.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: [
                    "'self'",
                    (_req, res: any) => `'nonce-${res.locals.cspNonce}'`,
                    'https://fonts.gstatic.com',
                    'https://fonts.googleapis.com',
                    'https://cdnjs.cloudflare.com',
                ],
                imgSrc: [
                    "'self'",
                    'https://apod.nasa.gov',
                    'https://openweathermap.org',
                ],
                connectSrc: ["'self'"],
                frameSrc: ["'self'"],
                objectSrc: ["'none'"],
                formAction: [
                    "'self'",
                    'https://accounts.google.com',
                    // Added for local development
                    'https://daily-dash.cryptospace.dev',
                ],
            },
        },
        referrerPolicy: {
            policy: 'no-referrer',
        },
        crossOriginOpenerPolicy: { policy: 'unsafe-none' },
    }),
);

configRouter.use(compression());

configRouter.use(accessLogger);

configRouter.use(favicon(path.join(fileRoot, 'public', 'favicon.ico')));

configRouter.use(express.static(path.join(fileRoot, '/public')));

configRouter.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

configRouter.use(session);

configRouter.use(doubleCsrfProtection);

configRouter.use(setCsrfToken);

configRouter.use(flash());

export default configRouter;
