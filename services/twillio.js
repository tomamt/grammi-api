/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
/**
 * Created by dibeesh on 12/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:services/twillio');
// const constant = require('../utilities/constant');
const config = require('../config/config');
const client = require('twilio')(config.api.twillioAccountSid, config.api.twillioAuthToken);

const twillioService = {
  createMessage: async (msg) => {
    client.messages
      .create({ body: 'Hi there!', from: '+15017122661', to: '+919496347047' })
      .then((message) => {
        debug(`Message response in twillio ${message.sid}`, httpContext.get('requestId'));
      });
  },
};
module.exports = twillioService;
