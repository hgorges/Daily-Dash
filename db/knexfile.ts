import { Knex } from 'knex';

const knexConfig: Knex.Config = {
    client: 'pg',
    connection: {
        host: process.env.DB_HOST!,
        port: parseInt(process.env.DB_PORT!),
        database: process.env.DB_NAME!,
        user: process.env.DB_USERNAME!,
        password: process.env.DB_PASSWORD!,
        charset: process.env.DB_CHARSET!,
        timezone: process.env.DB_TIMEZONE!,
    },
    migrations: {
        directory: './migrations',
    },
    seeds: {
        directory: './seeds',
    },
};

export default knexConfig;
