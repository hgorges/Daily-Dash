import ajv from '../config/ajv';
import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validate } from '../utils/utils';
import { renderSignup } from '../controller/signup';

const signupSchema: JSONSchemaType<{
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password: string;
    _csrf: string;
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
            minLength: 8,
        },
        confirm_password: {
            type: 'string',
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
    ],
    additionalProperties: false,
};

export default function validateSignup(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    validate(req, res, next, ajv().compile(signupSchema), renderSignup);
}
