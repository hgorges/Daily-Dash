import ajv from '../config/ajv';
import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validate } from '../utils/utils';
import { renderPasswordChange } from '../controller/passwordChange';

const passwordChangeSchema: JSONSchemaType<{
    userId: string;
    password: string;
    confirm_password: string;
    _csrf: string;
}> = {
    type: 'object',
    properties: {
        userId: {
            type: 'string',
            format: 'uuid',
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
    required: ['password', 'confirm_password'],
    additionalProperties: false,
};

export default function validatePasswordChange(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    validate(
        req,
        res,
        next,
        ajv().compile(passwordChangeSchema),
        renderPasswordChange,
    );
}
