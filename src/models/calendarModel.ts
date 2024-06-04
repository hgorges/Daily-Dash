import fs from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { calendar_v3 } from "@googleapis/calendar";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

export async function loadSavedCredentialsIfExist() {
    try {
        const content = fs.readFileSync(TOKEN_PATH, { encoding: "utf-8" });
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        console.log(process.cwd());
        return null;
    }
}

async function saveCredentials(client: OAuth2Client) {
    const content = fs.readFileSync(CREDENTIALS_PATH, { encoding: "utf-8" });
    const keys = JSON.parse(content);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: "authorized_user",
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    fs.writeFileSync(TOKEN_PATH, payload);
}

export async function authorize() {
    // const client = await loadSavedCredentialsIfExist();
    // if (client != null) {
    //     return client;
    // }
    const oAuth2Client = await authenticate({
        scopes: SCOPES,
        keyfilePath: TOKEN_PATH,
    });
    if (oAuth2Client.credentials != null) {
        await saveCredentials(oAuth2Client);
    }
    return oAuth2Client;
}

export async function listEvents(auth: OAuth2Client) {
    if (auth == null) {
        return "No connection";
    }
    const calendar = new calendar_v3.Calendar({ auth });
    const res = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
    });
    const events = res.data.items;
    if (!events || events.length === 0) {
        console.log("No upcoming events found.");
        return;
    }
    console.log("Upcoming 10 events:");
    events.map((event: calendar_v3.Schema$Event) => {
        const start = event?.start?.dateTime ?? event?.start?.date;
        console.log(`${start} - ${event.summary}`);
    });
}
