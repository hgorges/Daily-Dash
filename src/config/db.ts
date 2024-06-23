import { ClientConfig, Pool } from 'pg';

const config: ClientConfig = {
    user: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    host: process.env.DB_HOST as string,
    database: process.env.DB_NAME as string,
    port: parseInt(process.env.DB_PORT as string),
};

export default new Pool(config);
