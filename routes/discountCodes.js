const express = require('express');

const router = express.Router();
const discountCodes = require('../controllers/discountCodes');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for DiscountCode. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), discountCodes.saveDiscountCode,
  middlewareReponse.saveResponse);
router.get('/:discontCodeId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), discountCodes.getDiscountCode,
  middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), discountCodes.getAllDiscountCode,
  middlewareReponse.getAllResponse);
router.put('/:discontCodeId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), discountCodes.updateDiscountCode,
  middlewareReponse.updateResponse);
router.patch('/:discontCodeId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), discountCodes.updatePartialDiscountCode,
  middlewareReponse.updateResponse);
router.delete('/:discontCodeId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), discountCodes.deleteDiscountCode,
  middlewareReponse.deleteResponse);

module.exports = router;
