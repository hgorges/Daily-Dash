import ajv from '../config/ajv';
import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validate } from '../utils/utils';
import locale from 'locale-codes';
import { renderSettingsPage } from '../controller/settings';

const settingsSchema: JSONSchemaType<{
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    home_latitude: number;
    home_longitude: number;
    work_latitude: number;
    work_longitude: number;
    calendars: string;
    locale: string;
    time_zone: string;
}> = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            minLength: 3,
            maxLength: 20,
            pattern: '^[a-zA-Z0-9]*$',
            sanitize: (data: string) => data.trim().toLowerCase(),
        },
        first_name: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
            sanitize: (data: string) => data.trim(),
        },
        last_name: {
            type: 'string',
            minLength: 1,
            maxLength: 20,
            sanitize: (data: string) => data.trim(),
        },
        email: {
            type: 'string',
            format: 'email',
            sanitize: (data: string) => data.trim().toLowerCase(),
        },
        password: {
            type: 'string',
        },
        confirm_password: {
            type: 'string',
        },
        home_latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90,
        },
        home_longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180,
        },
        work_latitude: {
            type: 'number',
            minimum: -90,
            maximum: 90,
        },
        work_longitude: {
            type: 'number',
            minimum: -180,
            maximum: 180,
        },
        calendars: {
            type: 'string',
        },
        locale: {
            type: 'string',
            enum: locale.all.map((l) => l.tag),
        },
        time_zone: {
            type: 'string',
            enum: Intl.supportedValuesOf('timeZone'),
        },
        _csrf: {
            type: 'string',
        },
    },
    required: [
        'username',
        'first_name',
        'last_name',
        'email',
        'password',
        'confirm_password',
        'home_latitude',
        'home_longitude',
        'work_latitude',
        'work_longitude',
        'calendars',
        'locale',
        'time_zone',
    ],
    additionalProperties: false,
};

export default function validateSettings(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    req.body.home_latitude = parseFloat(req.body.home_latitude);
    req.body.home_longitude = parseFloat(req.body.home_longitude);
    req.body.work_latitude = parseFloat(req.body.work_latitude);
    req.body.work_longitude = parseFloat(req.body.work_longitude);

    validate(req, res, next, ajv().compile(settingsSchema), renderSettingsPage);
}
