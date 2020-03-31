const express = require('express');

const router = express.Router();
const orderStatus = require('../controllers/orderStatus');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

/* Redirect to API for OrderStatus. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderStatus.saveOrderItem, middlewareReponse.saveResponse);
router.get('/:orderStatusId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderStatus.getOrderItem, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderStatus.getAllOrderItem, middlewareReponse.getAllResponse);
router.put('/:orderStatusId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderStatus.updateOrderItem, middlewareReponse.updateResponse);
router.patch('/:orderStatusId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), orderStatus.updatePartialOrderItem,
  middlewareReponse.updateResponse);
router.delete('/:orderStatusId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), orderStatus.deleteOrderItem,
  middlewareReponse.deleteResponse);

module.exports = router;
