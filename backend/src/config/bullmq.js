const { Queue } = require("bullmq");
const redis = require("./redis");

const createQueue = (name) => {
  return new Queue(name, {
    connection: redis,
  });
};

module.exports = { createQueue };
