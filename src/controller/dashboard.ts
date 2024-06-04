import { Request, Response } from "express";
import { google } from "googleapis";
import fs from "fs";
import path from "path";
import axios from "axios";
import Parser from "rss-parser";

export const dashboardController = async (
    _request: Request,
    response: Response
) => {
    const OAuth2Secrets = fs.readFileSync(
        path.join(__dirname, "..", "..", "secrets", "googleOAuth2.json"),
        "utf-8"
    );
    const { clientId, clientSecret, redirectUri } = JSON.parse(OAuth2Secrets);
    const oauth2Client = new google.auth.OAuth2({
        clientId,
        clientSecret,
        redirectUri,
    });

    const scopes = ["https://www.googleapis.com/auth/calendar.readonly"];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
    });

    const apodRssFeed = await new Parser().parseURL(
        "https://apod.com/feed.rss"
    );

    const imageUrlRegex = /<img.*?src=["'](.*?)["']/;
    const match = apodRssFeed.items[0]["content:encoded"].match(imageUrlRegex);

    response.status(200).render("dashboard", {
        pageTitle: "Dashboard",
        path: "/",
        getDailyAppointments: "This is a calendar",
        apodImageLink: match[1],
        apodImageAlt: apodRssFeed.description,
        apodCaption: "",
        googleAuthUrl: url,
    });
};

export const googleAuthController = async (
    request: Request,
    response: Response
) => {
    const code = request.query.code;

    getToken(code as string);

    response.status(200).send();
};

async function getToken(authorizationCode: string) {
    try {
        const OAuth2Secrets = fs.readFileSync(
            path.join(__dirname, "..", "..", "secrets", "googleOAuth2.json"),
            "utf-8"
        );
        const { clientId, clientSecret, redirectUri } =
            JSON.parse(OAuth2Secrets);

        const accessTokenResponse = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                code: authorizationCode,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }
        );
        const { access_token } = accessTokenResponse.data;

        const calendarListResponse = await axios.get(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            }
        );

        const calendarList = calendarListResponse.data.items;

        console.log(calendarList);
    } catch (error) {
        console.error("Error getting token: ", error);
    }
}
