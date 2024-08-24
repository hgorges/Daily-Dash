import path from 'path';
import { Session } from 'express-session';
import { ErrorObject } from 'ajv';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import type { ValidateFunction } from 'ajv/dist/types';

export type AuthSession = Session & {
    username: string;
    isAdmin: boolean;
    isAuthenticated: boolean;
    isHome: boolean;
    googleCalendarAccessToken?: string;
};

export type ValidationError = {
    param: string;
    message: string | undefined;
    value: any;
};

export const fileRoot = path.join(__dirname, '..', '..');

export function validate(
    req: Request,
    res: Response,
    next: NextFunction,
    validateFunction: ValidateFunction,
    renderFunction: (
        req: Request,
        res: Response,
        next: NextFunction,
        renderOptions?: any,
    ) => void,
): void {
    const isValid = validateFunction(req.body);
    if (!isValid && validateFunction.errors) {
        const errors = parseErrors(validateFunction.errors);
        req.flash('error', errors.map((error) => error.message).join(', '));
        renderFunction(req, res, next, {
            statusCode: 422,
            errors,
            ...req.body,
        });
        return;
    }
    next();
}

function parseErrors(validationErrors: ErrorObject[]): any[] {
    const errors: ValidationError[] = [];
    validationErrors.forEach((error) => {
        errors.push({
            param: error.instancePath.replace(/[./]+/g, ''),
            message: error.message,
            value: error.data,
        });
    });
    return errors;
}
