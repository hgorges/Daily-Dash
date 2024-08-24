import path from 'path';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import express from 'express';
import cookieParser from 'cookie-parser';
import flash from 'connect-flash';
import { doubleCsrfProtection, setCsrfToken } from '../config/csrf';
import session from '../config/session';
import { fileRoot } from '../utils/utils';

const configRouter = express.Router();

configRouter.use(express.json());

configRouter.use(bodyParser.urlencoded({ extended: false }));

configRouter.use(favicon(path.join(fileRoot, 'public', 'favicon.ico')));

configRouter.use(express.static(path.join(fileRoot, '/public')));

configRouter.use(cookieParser(process.env.COOKIE_PARSER_SECRET));

configRouter.use(session);

configRouter.use(doubleCsrfProtection);

configRouter.use(setCsrfToken);

configRouter.use(flash());

export default configRouter;
