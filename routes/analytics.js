/* eslint-disable no-unused-vars */
const express = require('express');
const ModelService = require('../services/cartsModelService');

const router = express.Router();
const analytics = require('../controllers/analytics');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor'];
/* Redirect to API for analytics */

router.get('/terminal/:terminalId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getTerminalAnalytics,
  middlewareReponse.getByIdResponse);
router.get('/orders-efficiency/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getOrdersEfficiencyAnalytics,
  middlewareReponse.getAllResponse);
router.get('/cancellation-efficiency/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getCancellationEfficiencyAnalytics,
  middlewareReponse.getAllResponse);
router.get('/rating-efficiency/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getRatingEfficiencyAnalytics,
  middlewareReponse.getAllResponse);
router.get('/deliveries-efficiency/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getDeliveriesEfficiencyAnalytics,
  middlewareReponse.getAllResponse);
router.get('/avgordertime-efficiency/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getAvgOrderTimeEfficiencyAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-orders/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getVendorOrdersAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-sales/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getVendorSalesAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-location/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getVendorLocationAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-category/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getVendorCategoryAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-avgcookingtime/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getVendorAvgCookingTimeAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-avgdeliverytime/:terminalId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getTerminalAvgDeliveryTimeAnalytics,
  middlewareReponse.getAllResponse);
router.get('/vendors-avgordertime/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getVendorAvgOrderTimeAnalytics,
  middlewareReponse.getAllResponse);
router.get('/terminal-avgtime-deliveries/:terminalId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), analytics.getTerminalAvgBetweenDeliveriesTimeAnalytics,
  middlewareReponse.getAllResponse);

module.exports = router;
