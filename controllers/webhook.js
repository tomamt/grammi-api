/**
 * Created by dibeesh on 6/11/19.
 */
// const debug = require('debug')('grammi-api:controllers/consumer');
const stripeService = require('../services/stripe');

const WebhookApi = {
  webhook: async (req, res, next) => {
    await stripeService.webhookHandling(req, res, next);
  },
};
module.exports = WebhookApi;
