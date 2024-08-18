import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const redisClient = createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD}@cache:${process.env.REDIS_PORT}`,
});
redisClient.connect().catch(console.error);

export default new RedisStore({
    client: redisClient,
});
