const { createQueue } = require("../config/bullmq");
const { MAIL_QUEUE } = require("./queueNames");

const mailQueue = createQueue(MAIL_QUEUE);

module.exports = mailQueue;
