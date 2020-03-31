/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
/* eslint-disable class-methods-use-this */
const redis = require('redis');

const client = redis.createClient(process.env.redisPort, process.env.redisHost);

class SocketService {
  constructor() {}

  async sendToSocket(name, data) {
    client.publish(name, data);
    return 'Successfully called';
  }
}

module.exports = SocketService;
