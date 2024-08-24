import ajv from '../config/ajv';
import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { validate } from '../utils/utils';
import { renderLogin } from '../controller/login';

const emptyBodySchema: JSONSchemaType<{
    _csrf: string;
}> = {
    type: 'object',
    properties: {
        _csrf: {
            type: 'string',
        },
    },
    required: [],
    additionalProperties: false,
};

export default function validateEmptyBody(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    validate(req, res, next, ajv().compile(emptyBodySchema), renderLogin);
}
