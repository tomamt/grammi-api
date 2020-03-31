/**
 * Created by dibeesh on 6/11/19.
 */
const express = require('express');

const router = express.Router();
const webhook = require('../controllers/webhook');
const middlewareReponse = require('../middleware/response');
/* Redirect to API for stripe. */
router.post('/webhook', webhook.webhook, middlewareReponse.stripeWebhookResponse);


module.exports = router;
