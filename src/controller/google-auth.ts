import axios from 'axios';
import { NextFunction, Response } from 'express';
import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';
import { AuthRequest } from '../utils/utils';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const OAuth2SecretsPath = path.join(
    __dirname,
    '..',
    '..',
    'secrets',
    'googleOAuth2.json',
);

export function getAuthUrl(): string {
    const OAuth2Secrets = fs.readFileSync(OAuth2SecretsPath, 'utf-8');
    const { clientId, clientSecret, redirectUri } = JSON.parse(OAuth2Secrets);
    const oauth2Client = new google.auth.OAuth2({
        clientId,
        clientSecret,
        redirectUri,
    });

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
}

export const redirectFromGoogle = async (
    req: AuthRequest,
    res: Response,
    _next: NextFunction,
) => {
    const code = req.query.code;

    await getToken(req, code as string);

    res.redirect('/');
};

async function getToken(req: AuthRequest, authorizationCode: string) {
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
