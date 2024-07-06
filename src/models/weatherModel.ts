import axios from 'axios';
import assert from 'node:assert';
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
    uvi_color: string;
    clouds: number;
    wind_speed: number;
    wind_speed_color: string;
};

const weatherModel = {
    async getWeatherApiKey(): Promise<{ api_key: string }> {
        return db('api_keys')
            .where('api_name', 'OpenWeather')
            .select('api_key')
            .first();
    },

    async getWeatherData(
        username: string,
        isHome: boolean,
    ): Promise<WeatherData | null> {
        const { api_key } = await this.getWeatherApiKey();
        assert(api_key, 'Weather API key not found');

        const user = await userModel.getUserByUsername(username);
        assert(user, 'User not found');

        if (user.home_gps === null || user.work_gps === null) {
            return null;
        }

        const gps = isHome ? user.home_gps : user.work_gps;

        const response = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${gps.x}&lon=${gps.y}&date=${new Date().toISOString().substring(0, 10)}&appid=${api_key}&units=metric`,
        );

        const weatherData: WeatherData = response.data.daily[0];

        weatherData.weather = weatherData.weather.map((weather) => ({
            iconUrl: `https://openweathermap.org/img/wn/${weather.icon}.png`,
            ...weather,
        }));

        const placeResponse = await axios.get(
            `http://api.openweathermap.org/geo/1.0/reverse?lat=${gps.x}&lon=${gps.y}&limit=1&appid=${api_key}`,
        );

        let uvi_color = '';
        if (weatherData.uvi < 3) {
            uvi_color = 'uvi-low';
        } else if (weatherData.uvi < 6) {
            uvi_color = 'uvi-moderate';
        } else if (weatherData.uvi < 8) {
            uvi_color = 'uvi-high';
        } else if (weatherData.uvi < 11) {
            uvi_color = 'uvi-very-high';
        } else {
            uvi_color = 'uvi-extreme';
        }

        weatherData.wind_speed = Math.floor(weatherData.wind_speed * 3.6);
        let wind_speed_color = '';
        if (weatherData.wind_speed <= 11) {
            wind_speed_color = 'wind-calm-light-breeze';
        } else if (weatherData.wind_speed <= 28) {
            wind_speed_color = 'wind-gentle-moderate-breeze';
        } else if (weatherData.wind_speed <= 49) {
            wind_speed_color = 'wind-fresh-strong-breeze';
        } else if (weatherData.wind_speed <= 88) {
            wind_speed_color = 'wind-near-gale-gale';
        } else {
            wind_speed_color = 'wind-strong-gale-hurricane';
        }

        return {
            ...weatherData,
            uvi_color,
            wind_speed_color,
            place: placeResponse.data[0].name,
        };
    },
};

export default weatherModel;
