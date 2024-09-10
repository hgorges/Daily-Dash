import winston from 'winston';
import fs from 'fs';
import path from 'path';
import morgan from 'morgan';

export const logger = winston.createLogger({
    exitOnError: false,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.colorize(),
        winston.format.errors({ stack: true }),
        winston.format.printf(
            (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logfile.log' }),
    ],
});

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '..', '..', 'access.log'),
    {
        flags: 'a',
    },
);

export const accessLogger = morgan('short', { stream: accessLogStream });
