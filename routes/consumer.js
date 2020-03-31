const express = require('express');
const validation = require('../middleware/customValidations');

const router = express.Router();
const consumer = require('../controllers/consumers');
const geoLocation = require('../controllers/geoLocation');
const install = require('../controllers/install');
const middlewareReponse = require('../middleware/response');
/* Redirect to API for Consumers. */
router.post('/install', install.install, middlewareReponse.getAllResponse);
router.post('/install/terminals', install.installTerminals, middlewareReponse.getAllResponse);
router.post('/install/user-role/permissions', install.installUserRolePermissions, middlewareReponse.getAllResponse);
router.get('/deliveryAreas/:deliveryAreaId/menu', consumer.getVenueMenuItem, middlewareReponse.getAllResponse);
router.get('/venues/:venueId/vendors/:vendorId/menu', consumer.getVendorMenuItem, middlewareReponse.getAllResponse);
router.get('/settings', consumer.getGeneralSettings, middlewareReponse.consumerResponse);
router.get('/venues/:venueId/cart/:cartId/recipient/:recipientId/payment/intent', consumer.createPayment,
  middlewareReponse.consumerResponse);
router.get('/deliveryTimeSlot/venues/:venueId/cart/:cartId', consumer.getOrderDeliveryTimeSlot,
  middlewareReponse.getAllResponse);
router.post('/venues/:venueId/cart/:cartId/recipient', validation.ruleCreateRecipient(), validation.validate,
  consumer.createRecipient, middlewareReponse.consumerResponse);
router.post('/venues/:venueId/cart/:cartId/recipient/:recipientId/otp', validation.ruleVerifyOtp(), validation.validate,
  consumer.verifyOtp, middlewareReponse.consumerResponse);
router.get('/venues/:venueId/recipient/:recipientId/order/:orderId', consumer.getOrderDetails,
  middlewareReponse.consumerResponse);
router.get('/venues/:venueId/recipient/:recipientId/order', consumer.GetAllConsumerOrder, middlewareReponse.consumerResponse);
router.post('/venues/:venueId/recipient/:recipientId/order/:orderId/status', validation.ruleOrderStatusChange(),
  validation.validate, consumer.orderStatusChange, middlewareReponse.consumerResponse);
router.post('/venues/:venueId/recipient/:recipientId/order/:orderId/rating', validation.ruleRating(),
  validation.validate, consumer.rating, middlewareReponse.consumerResponse);
router.post('/venues/:venueId/vendor/:vendorId/cart', consumer.createCart, middlewareReponse.consumerResponse);
router.put('/venues/:venueId/vendor/:vendorId/cart/:cartId', consumer.createCart, middlewareReponse.consumerResponse);
router.patch('/venues/:venueId/vendor/:vendorId/cart/:cartId', consumer.updateCart, middlewareReponse.consumerResponse);
router.delete('/venues/:venueId/vendor/:vendorId/cart/:cartId', consumer.removeCart, middlewareReponse.deleteResponse);
router.post('/venues/:venueId/cart/:cartId/recipient/:recipientId/coupon', consumer.validateCoupon, middlewareReponse.consumerResponse);
router.patch('/venues/:venueId/cart/:cartId/coupon', consumer.removeCoupon, middlewareReponse.consumerResponse);
router.post('/geo-location', geoLocation.saveGeoLocation, middlewareReponse.consumerResponse);

module.exports = router;
