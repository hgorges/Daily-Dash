import { calendar_v3 } from '@googleapis/calendar';
import axios from 'axios';
import { formatRFC3339 } from 'date-fns';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { db } from '../server';
import { Request } from 'express-serve-static-core';

const calendarModel = {
    async getCalendars(
        req: Request,
    ): Promise<calendar_v3.Schema$CalendarListEntry[] | null> {
        const { username, googleCalendarAccessToken: access_token } =
            req.session;

        if (access_token == null) {
            return null;
        }

        const calendarListResponse = await axios.get(
            'https://www.googleapis.com/calendar/v3/users/me/calendarList/',
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            },
        );
        const availableCalendars: calendar_v3.Schema$CalendarListEntry[] =
            calendarListResponse.data.items;

        const { calendars }: { calendars: string[] } = await db('users')
            .select('calendars')
            .where({ username })
            .first();

        return availableCalendars.filter(
            (calendar) =>
                calendar.summary != null &&
                calendars.includes(calendar.summary),
        );
    },

    async getCalendarEvents(req: Request): Promise<calendar_v3.Schema$Event[]> {
        const { googleCalendarAccessToken: access_token } = req.session;

        if (access_token == null) {
            return [];
        }

        let calendars;
        try {
            calendars = await calendarModel.getCalendars(req);
        } catch {
            req.session.googleCalendarAccessToken = undefined;
            return [];
        }

        if (calendars == null) {
            return [];
        }

        const oAuth2 = new google.auth.OAuth2();
        oAuth2.setCredentials({ access_token });

        const events: calendar_v3.Schema$Event[] = [];
        for (const calendar of calendars) {
            const calendarEvents = await calendarModel.listEvents(
                oAuth2 as any,
                (calendar as any).id,
            );

            events.push(
                ...calendarEvents.map((calendarEvent) => ({
                    ...calendarEvent,
                    color: calendar.backgroundColor,
                })),
            );
        }

        events.sort(this.sortEventsByStartTime);

        return this.convertEventTimeToUserTimezone(
            req.session.username,
            events,
        );
    },

    sortEventsByStartTime(
        eventA: calendar_v3.Schema$Event,
        eventB: calendar_v3.Schema$Event,
    ): number {
        if (eventA.start?.dateTime == null) {
            return Number.MIN_SAFE_INTEGER;
        }

        if (eventB.start?.dateTime == null) {
            return Number.MAX_SAFE_INTEGER;
        }

        return (
            new Date(eventA.start.dateTime).getTime() -
            new Date(eventB.start.dateTime).getTime()
        );
    },

    async convertEventTimeToUserTimezone(
        username: string,
        events: calendar_v3.Schema$Event[],
    ): Promise<calendar_v3.Schema$Event[]> {
        const { locale, time_zone } = await db('users')
            .select(['locale', 'time_zone'])
            .where({ username })
            .first();

        for (const event of events) {
            if (event.start?.dateTime == null || event.end?.dateTime == null) {
                continue;
            }

            event.start.dateTime = new Date(event.start?.dateTime)
                .toLocaleTimeString(locale, {
                    timeZone: time_zone,
                    timeStyle: 'short',
                })
                .replace(',', '');
            event.end.dateTime = new Date(
                event.end?.dateTime,
            ).toLocaleTimeString(locale, {
                timeZone: time_zone,
                timeStyle: 'short',
            });
        }

        return events;
    },

    async listEvents(
        auth: OAuth2Client,
        calendarId: string,
    ): Promise<calendar_v3.Schema$Event[]> {
        const calendar = new calendar_v3.Calendar({ auth });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const res = await calendar.events.list(
            {
                calendarId: calendarId,
                timeMin: formatRFC3339(startOfDay),
                timeMax: formatRFC3339(endOfDay),
                timeZone: 'UTC',
                singleEvents: true,
                orderBy: 'startTime',
            },
            { apiVersion: 'v3' },
        );
        if (!res.data.items || res.data.items.length === 0) {
            return [];
        }

        return res.data.items;
    },
};

export default calendarModel;
