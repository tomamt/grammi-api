const express = require('express');

const router = express.Router();
const orderItems = require('../controllers/orderItems');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

// const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor',
// 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for OrderItems. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderItems.saveOrderItem, middlewareReponse.saveResponse);
router.get('/:orderItemsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderItems.getOrderItem, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderItems.getAllOrderItem,
  middlewareReponse.getAllResponse);
router.put('/:orderItemsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderItems.updateOrderItem,
  middlewareReponse.updateResponse);
router.patch('/:orderItemsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderItems.updatePartialOrderItem,
  middlewareReponse.updateResponse);
router.delete('/:orderItemsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderItems.deleteOrderItem,
  middlewareReponse.deleteResponse);

module.exports = router;
