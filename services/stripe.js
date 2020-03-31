/* eslint-disable import/order */
/* eslint-disable global-require */
/* eslint-disable max-len */
/* eslint-disable no-case-declarations */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const debug = require('debug')('grammi-api:services/stripe');
const createError = require('http-errors');
const Constant = require('../utilities/constant');
const config = require('../config/config');
const stripe = require('stripe')(config.api.stripeSecret);
const ModelService = require('../services/modelService');
const ReferencedModelService = require('../services/referencedModelService');
const ordersModel = require('../models/orders');

const VendorReferences = Constant.reference.vendor;
// stripe.setApiVersion(config.api.stripeApiVersion);
const transactionsModel = require('../models/transactions');
const orderHistoryModel = require('../models/orderHistory');
const socket = require('../controllers/socket');

const transactionService = new ModelService(transactionsModel);
const orderService = new ReferencedModelService(ordersModel, VendorReferences);
const orderHistoryService = new ModelService(orderHistoryModel);
const stripeService = {
  createCustomer: async (userData) => { // Archived as not creating user now
    const { params } = userData;
    const createUserRes = await stripe.customers.create(params);
    return createUserRes;
  },
  createCharge: async (charge) => { // Archived
    /* let params = {
      amount: 10 * 100,
      currency: 'usd',
      customer: customer.id,
      description: 'Thank you for your generous donation.'
    }; */
    const { params } = charge;
    const chargeRes = stripe.charges.create(params);
    return chargeRes;
  },
  createPaymentIntent: async (intent) => {
    try {
      const params = {
        amount: Math.round(intent.amount.toFixed(2) * config.api.currencyMinimumUnit),
        currency: config.api.currency,
        payment_method_types: config.api.paymentMethodTypes,
        metadata: intent.metadata,
      };
      const paymentIntent = await stripe.paymentIntents.create(params);
      return paymentIntent;
    } catch (err) {
      debug('error payment intent', err.message);
      throw new Error(err.message);
    }
  },
  RetrievePaymentIntent: async (intent) => {
    try {
      const intentId = intent;
      const paymentIntent = await stripe.paymentIntents.retrieve(intentId);
      return paymentIntent;
    } catch (err) {
      debug('error payment intent retrieve', err.message);
      const errorRes = createError(err.status, err.message);
      throw new Error(errorRes);
    }
  },
  updatePaymentIntent: async (intent) => { // with shipping/delivery charge
    try {
      const params = {
        amount: Math.round(intent.amount.toFixed(2) * config.api.currencyMinimumUnit),
      };
      const paymentIntent = await stripe.paymentIntents.update(intent.paymentIntentId, params);
      return paymentIntent;
    } catch (err) {
      debug('error payment intent update', err.message);
      const errorRes = createError(err.status, err.message);
      throw new Error(errorRes);
    }
  },
  webhookHandling: async (req, res, next) => {
    debug('testttttttttttttttttttt');
    const consumer = require('../controllers/consumers');
    /* await consumer.paymentIntentSuccess(req.body);
    return */
    next();
    const sig = req.headers['stripe-signature'];
    let event;
    // debug('req.rawBody', req.rawBody);
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, config.api.stripeWebhookSecret);
    } catch (err) {
      debug(`Webhook Error: ${err.message}`);
      // throw new Error(err.message);
    }
    debug('event type', event.type);
    // debug('event object', event.data.object);
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentSuccess = event.data.object;
        debug('PaymentIntent was successful!', JSON.stringify(paymentSuccess));
        await consumer.paymentIntentSuccess(paymentSuccess);
        break;
      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object;
        const paymentSourceOrMethod = paymentFailed.last_payment_error
          .payment_method
          ? paymentFailed.last_payment_error.payment_method
          : paymentFailed.last_payment_error.source;
        debug('PaymentIntent was failed!');
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        debug('PaymentMethod was attached to a Customer!');
        break;
      case 'payment_intent.created':
        const paymentIntentCreated = event.data.object;
        debug('payment_intent.created');
        break;
      case 'charge.refunded':
        const obj = {};
        if (typeof event.data.object.payment_intent === 'string') {
          obj.query = {
            paymentIntentId: event.data.object.payment_intent,
          };
        } else {
          obj.query = {
            paymentIntentId: event.data.object.payment_intent.toString(),
          };
        }
        debug(obj, 'Obj in stripe webhook');
        const orderDetails = await ordersModel.findOne({ paymentIntentId: obj.query.paymentIntentId }).populate([
          {
            path: 'currency',
            model: 'currencies',
          },
          {
            path: 'vendorId',
            model: 'vendors',
            populate: [{
              path: 'venueId',
              model: 'venues',
            },
            {
              path: 'crewIds',
              match: {
                status: 'active',
              },
              model: 'users',
            },
            ],
          },
          {
            path: 'deliveryLocationId',
            model: 'deliverylocations',
          },
          {
            path: 'menuItem.menuItemId',
            model: 'menuItems',
            populate: [
              /* {
                path: 'currencyId',
                model: 'currencies',
              }, */
              {
                path: 'mediaId.square',
                model: 'medias',
              },
              {
                path: 'mediaId.rectangle',
                model: 'medias',
              },
              {
                path: 'vendorId',
                model: 'vendors',
                populate: {
                  path: 'venueId',
                  model: 'venues',
                },
              },
              {
                path: 'vendorTagId',
                model: 'vendorTags',
              },
            ],
          },
        ]);
        // const orderDetails = await orderService.getByCustomField(obj);
        if (orderDetails) {
          const orderHistoryDetails = {
            orderId: orderDetails._id,
            action: 'status-change',
            key: 'status',
            oldValue: orderDetails.status,
            newValue: 'refund-completed',
          };
          const orderHistorySaveRes = await orderHistoryService.save(orderHistoryDetails);
          // console.log(orderHistorySaveRes, 'orderHistorySaveRes');
          const transactionData = {
            recipientId: orderDetails.recipientId,
            orderId: orderDetails._id,
            // status: orderDetails[0].status,
            amount: parseFloat(event.data.object.refunds.data[0].amount).toFixed(2) / config.api.currencyMinimumUnit,
            paymentIntentId: orderDetails.paymentIntentId,
            balanceTransaction: event.data.object.refunds.data[0].balance_transaction,
            charge: event.data.object.refunds.data[0].charge,
          };
          if (event.data.object.amount_refunded < event.data.object.amount) {
            transactionData.status = 'partialRefund';
          } else {
            transactionData.status = 'fullRefund';
          }
          const transactionSaveRes = await transactionService.save(transactionData);
          const refundNotification = await socket.refundOrderStatus(orderDetails);
        }
        break;
        // ... handle other event types
      default:
        // Unexpected event type
        debug('Unexpected event type', event.type);
        // next();
    }
    // Return a res to acknowledge receipt of the event
  },
  createRefundIntent: async (obj) => {
    try {
      const params = {
        payment_intent: obj.payment_intent,
      };
      if (obj.amount) {
        params.amount = Math.round(parseFloat(obj.amount).toFixed(2) * config.api.currencyMinimumUnit);
      }
      const paymentIntent = await stripe.refunds.create(params);
      return paymentIntent;
    // }
    } catch (err) {
      debug('error payment intent', err.message);
      throw new Error(err.message);
    }
  },
};
module.exports = stripeService;
