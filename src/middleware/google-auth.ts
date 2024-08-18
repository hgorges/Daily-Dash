import axios from 'axios';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const OAuth2SecretsPath = path.join(
    __dirname,
    '..',
    '..',
    'secrets',
    'googleOAuth2.json',
);

export async function redirectToGoogle(
    _req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    const OAuth2Secrets = fs.readFileSync(OAuth2SecretsPath, 'utf-8');
    const { clientId, clientSecret, redirectUri } = JSON.parse(OAuth2Secrets);
    const oauth2Client = new google.auth.OAuth2({
        clientId,
        clientSecret,
        redirectUri,
    });

    res.redirect(
        oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        }),
    );
}

export async function redirectFromGoogle(
    req: Request,
    res: Response,
    _next: NextFunction,
): Promise<void> {
    const code = req.query.code;

    await getGoogleAuthToken(req, code as string);

    res.redirect('/');
}

async function getGoogleAuthToken(req: Request, authorizationCode: string) {
    try {
        const OAuth2Secrets = fs.readFileSync(OAuth2SecretsPath, 'utf-8');
        const { clientId, clientSecret, redirectUri } =
            JSON.parse(OAuth2Secrets);

        const accessTokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code: authorizationCode,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            },
        );
        const { access_token } = accessTokenResponse.data;
        req.session.googleCalendarAccessToken = access_token;
    } catch (error) {
        console.error('Error getting token: ', error);
    }
}
