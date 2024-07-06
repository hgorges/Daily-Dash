import { Client, UnitSystem } from '@googlemaps/google-maps-services-js';
import assert from 'node:assert';
import { db } from '../server';
import { User } from './userModel';

type TrafficData = {
    from: string;
    to: string;
    routes: TrafficRoutesData[];
};

type TrafficRoutesData = {
    summary: string;
    // in meters
    distance: number;
    // in seconds
    duration: number;
};

const trafficModel = {
    async getGoogleMapsApiKey(): Promise<{ api_key: string }> {
        return db('api_keys')
            .where('api_name', 'Google Maps')
            .select('api_key')
            .first();
    },

    async getTrafficData(
        isHome: boolean,
        user?: User,
    ): Promise<TrafficData | null> {
        assert(user, 'User not found');

        if (user.home_gps === null || user.work_gps === null) {
            return null;
        }

        const client = new Client({});

        const from = isHome ? user.home_gps : user.work_gps;
        const to = isHome ? user.work_gps : user.home_gps;

        const directions = await client.directions({
            params: {
                origin: { lat: from.x, lng: from.y },
                destination: { lat: to.x, lng: to.y },
                key: (await this.getGoogleMapsApiKey()).api_key,
                alternatives: true,
                departure_time: 'now',
                units: UnitSystem.metric,
            },
        });

        return {
            from: directions.data.routes[0].legs[0].start_address,
            to: directions.data.routes[0].legs[0].end_address,
            routes: directions.data.routes
                .map((route) => ({
                    summary: route.summary,
                    distance: route.legs[0].distance.value,
                    duration: route.legs[0].duration.value,
                }))
                .sort((a, b) => a.duration - b.duration),
        };
    },
};

export default trafficModel;
