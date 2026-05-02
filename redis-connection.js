import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

function createRedisConnection() {
     return new Redis(process.env.REDIS_URL);
}

export const publisher = createRedisConnection();
export const subscriber = createRedisConnection();
export const RedisClient = createRedisConnection();
export const rateLimiter = createRedisConnection();