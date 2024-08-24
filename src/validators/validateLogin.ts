import ajv from '../config/ajv';
import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validate } from '../utils/utils';
import { renderLogin } from '../controller/login';

const loginSchema: JSONSchemaType<{
    username: string;
    password: string;
}> = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            sanitize: (data: string) => data.trim().toLowerCase(),
        },
        password: {
            type: 'string',
        },
        _csrf: {
            type: 'string',
        },
    },
    required: ['username', 'password'],
    additionalProperties: false,
};

export default function validateLogin(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    validate(req, res, next, ajv().compile(loginSchema), renderLogin);
}
