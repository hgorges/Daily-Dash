import path from 'path';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { doubleCsrf } from 'csrf-csrf';
import flash from 'connect-flash';

const configRouter = express.Router();

const redisClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@cache:${process.env.REDIS_PORT}`,
});
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
    client: redisClient,
});

const { doubleCsrfProtection, generateToken } = doubleCsrf({
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

export const fileRoot = path.join(__dirname, '..', '..');

configRouter.use(bodyParser.urlencoded({ extended: false }));

configRouter.use(favicon(path.join(fileRoot, 'public', 'favicon.ico')));

configRouter.use(express.static(path.join(fileRoot, '/public')));

configRouter.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

configRouter.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        store: redisStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        },
    }),
);

configRouter.use(doubleCsrfProtection);

configRouter.use((req, res, next) => {
    res.locals.csrfToken = generateToken(req, res, true);
    next();
});

configRouter.use(flash());

export default configRouter;
