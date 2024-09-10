import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { logger } from './logger';

const redisClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@cache:${process.env.REDIS_PORT}`,
});
redisClient.connect().catch(logger.error);

export default new RedisStore({
    client: redisClient,
});
