import dotenv from 'dotenv';
import https from 'https';
import bodyParser from 'body-parser';
import RedisStore from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import fs from 'fs';
import Knex from 'knex';
import path from 'path';
import { createClient } from 'redis';
import favicon from 'serve-favicon';
import knexConfig from '../db/knexfile';
import sessionRouter from './routes/sessionRoute';
import userRoutes from './routes/userRoutes';

dotenv.config({ path: '../secrets/.env' });

export const db = Knex(knexConfig);

const redisClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@cache:${process.env.REDIS_PORT}`,
});
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
    client: redisClient,
});

const app = express();
const port = parseInt(process.env.PORT as string);

export const fileRoot = path.join(__dirname, '..');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(fileRoot, 'public', 'favicon.ico')));
app.use(express.static(path.join(fileRoot, '/public')));
app.use(
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

app.use(cors(), sessionRouter);

app.use(userRoutes);

const privateKey = fs.readFileSync(
    path.join(__dirname, '..', 'secrets', 'cryptospace.key'),
    'utf8',
);
const certificate = fs.readFileSync(
    path.join(__dirname, '..', 'secrets', 'cryptospace.crt'),
    'utf8',
);

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);

console.log(`Server is running on port ${port}`);
