import dotenv from 'dotenv';
import https from 'https';
import express from 'express';
import fs from 'fs';
import Knex from 'knex';
import path from 'path';
import knexConfig from '../db/knexfile';
import configRouter from './routes/configRoutes';
import sessionRouter from './routes/sessionRoutes';
import userRouter from './routes/userRoutes';
import nodemailer from 'nodemailer';
import nodemailerSendGrid from 'nodemailer-sendgrid';

dotenv.config({ path: '../secrets/.env' });

export const db = Knex(knexConfig);

const app = express();
const port = parseInt(process.env.PORT as string);

export const mailer = nodemailer.createTransport(
    nodemailerSendGrid({
        apiKey: process.env.SENDGRID_API_KEY!,
    }),
);

app.set('view engine', 'ejs');

app.use(configRouter);
app.use(sessionRouter);
app.use(userRouter);

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
