const IORedis = require("ioredis");

const createRedisConnection = () =>
  new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

module.exports = createRedisConnection;
