const express = require('express');

const router = express.Router();
const orders = require('../controllers/orders');
const consumer = require('../controllers/consumers');
const middlewareReponse = require('../middleware/response');
const jwtValidation = require('../middleware/jwtValidation');
// router.use(jwtValidation.checkJwt);
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for MenuItem. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orders.saveOrder, middlewareReponse.saveResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.getAllOrder, middlewareReponse.getAllResponse);
router.get('/:orderId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.getOrder, middlewareReponse.getByIdResponse);
router.put('/:orderId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.updateOrder, middlewareReponse.updateResponse);
router.patch('/:orderId', jwtValidation.checkJwt, jwtValidation.decode, orders.updatePartialOrder,
  middlewareReponse.updateResponse);
router.delete('/:orderId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orders.deleteOrder, middlewareReponse.deleteResponse);
router.get('/vendors/:vendorId/crew', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.getOrderForCrew, middlewareReponse.getAllResponse);
router.get('/vendors/:vendorId/crew/orders', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.getPastOrdersForCrew, middlewareReponse.getAllResponse);
router.get('/delivery-agents/:deliveryAgentId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.getOrderForDeliveryAgent,
  middlewareReponse.getAllResponse);
router.get('/vendors/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.getOrderForVendor, middlewareReponse.getAllResponse);
router.post('/:orderId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orders.refundOrderAmount, middlewareReponse.saveResponse);
router.get('/venues/:venueId/recipient/:recipientId/order/:orderId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), consumer.getOrderDetails,
  middlewareReponse.consumerResponse);
router.post('/notifyUser/:orderId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orders.notifyUserNotification, middlewareReponse.updateResponse);
module.exports = router;
