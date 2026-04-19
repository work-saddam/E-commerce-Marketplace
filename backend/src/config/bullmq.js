const { Queue } = require("bullmq");
const createRedisConnection = require("./redis");

const createQueue = (name) => {
  return new Queue(name, {
    connection: createRedisConnection(),
  });
};

module.exports = { createQueue };
