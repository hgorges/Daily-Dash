import ajv from '../config/ajv';
import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validate } from '../utils/utils';
import { renderPasswordReset } from '../controller/passwordReset';

const passwordResetSchema: JSONSchemaType<{
    email: string;
    _csrf: string;
}> = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            sanitize: (data: string) => data.trim().toLowerCase(),
        },
        _csrf: {
            type: 'string',
        },
    },
    required: ['email'],
    additionalProperties: false,
};

export default function validatePasswordReset(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    validate(
        req,
        res,
        next,
        ajv().compile(passwordResetSchema),
        renderPasswordReset,
    );
}
