import assert from 'assert';
import axios from 'axios';
import { db } from '../server';
import userModel from './userModel';

type WeatherData = {
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
        iconUrl?: string;
    }[];
    summary: string;
    place: string;
    temp: {
        min: number;
        max: number;
        morn: number;
        day: number;
        eve: number;
        night: number;
    };
    humidity: number;
    uvi: number;
    clouds: number;
    wind_speed: number;
};

const weatherModel = {
    async getWeatherApiKey(): Promise<{ api_key: string }> {
        const weatherApiKey = await db('api_keys')
            .where('api_name', 'OpenWeather')
            .select('api_key')
            .first();
        return weatherApiKey;
    },

    async getWeatherData(
        username: string,
        isHome: boolean
    ): Promise<WeatherData> {
        const { api_key } = await this.getWeatherApiKey();
        assert(api_key, 'Weather API key not found');

        const user = await userModel.getUserByUsername(username);
        assert(user, 'User not found');

        const gps = isHome ? user.home_gps : user.work_gps;

        const response = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${gps.x}&lon=${gps.y}&date=${new Date().toISOString().substring(0, 10)}&appid=${api_key}&units=metric`
        );

        const weatherData: WeatherData = response.data.daily[0];

        weatherData.weather = weatherData.weather.map((weather) => ({
            iconUrl: `https://openweathermap.org/img/wn/${weather.icon}.png`,
            ...weather,
        }));

        const placeResponse = await axios.get(
            `http://api.openweathermap.org/geo/1.0/reverse?lat=${gps.x}&lon=${gps.y}&limit=1&appid=${api_key}`
        );

        return {
            ...weatherData,
            place: placeResponse.data[0].name,
        };
    },
};

export default weatherModel;
