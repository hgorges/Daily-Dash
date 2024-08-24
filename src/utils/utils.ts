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
        const error = parseErrors(validateFunction.errors);
        req.flash('error', error.map((e) => e.message).join(', '));
        renderFunction(req, res, next, req.body);
        return;
    }
    next();
}

function parseErrors(validationErrors: ErrorObject[]): any[] {
    const errors: any[] = [];
    validationErrors.forEach((error) => {
        errors.push({
            param:
                error.params['missingProperty'] !== undefined
                    ? error.params['missingProperty']
                    : error.instancePath,
            message: error.message,
            value:
                error.params['missingProperty'] !== undefined
                    ? null
                    : error.data,
        });
    });
    return errors;
}
