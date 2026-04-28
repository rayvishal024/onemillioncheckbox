import redis from "ioredis";

function createRedisConnection() {
     return new redis({
          host: 'localhost',
          port: 6379
     })
}

export const publisher = createRedisConnection();

export const subscriber = createRedisConnection();

export const Redis = createRedisConnection();

export const rateLimiter = createRedisConnection();