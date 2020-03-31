const express = require('express');

const router = express.Router();
const orderHistory = require('../controllers/orderHistory');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

/* Redirect to API for OrderHistory. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderHistory.saveOrderItem, middlewareReponse.saveResponse);
router.get('/:orderHistoryId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderHistory.getOrderItem, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderHistory.getAllOrderItem, middlewareReponse.getAllResponse);
router.put('/:orderHistoryId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderHistory.updateOrderItem, middlewareReponse.updateResponse);
router.patch('/:orderHistoryId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderHistory.updatePartialOrderItem,
  middlewareReponse.updateResponse);
router.delete('/:orderHistoryId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderHistory.deleteOrderItem,
  middlewareReponse.deleteResponse);

module.exports = router;
