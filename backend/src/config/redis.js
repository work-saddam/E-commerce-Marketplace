const IORedis = require("ioredis");

const createRedisConnection = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }
  const connection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  connection.on("error", (err) => {
    console.error("Redis connection error:", err);
  });
  return connection;
};

module.exports = createRedisConnection;
