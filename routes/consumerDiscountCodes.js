/* eslint-disable max-len */
const express = require('express');

const router = express.Router();
const consumerDiscountCodes = require('../controllers/consumerDiscountCodes');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor'];
/* Redirect to API for DiscountCode. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), consumerDiscountCodes.saveConsumerDiscountCode, middlewareReponse.saveResponse);
router.get('/:consumerDiscountCodeId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), consumerDiscountCodes.getConsumerDiscountCode, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), consumerDiscountCodes.getAllConsumerDiscountCode, middlewareReponse.getAllResponse);
router.put('/:consumerDiscountCodeId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), consumerDiscountCodes.updateConsumerDiscountCode, middlewareReponse.updateResponse);
// router.patch('/:discontCodeId', consumerDiscountCodes.updatePartialDiscountCode, middlewareReponse.updateResponse);
// router.delete('/:discontCodeId', consumerDiscountCodes.deleteDiscountCode, middlewareReponse.deleteResponse);

module.exports = router;
