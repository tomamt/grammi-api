/**
 * Created by dibeesh on 29/11/19.
 */
const express = require('express');

const router = express.Router();
const transaction = require('../controllers/transactions');
const middlewareResponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

// const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor',
// 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for transactions. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), transaction.saveTransaction,
  middlewareResponse.saveResponse);
router.get('/:transactionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), transaction.getTransaction,
  middlewareResponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), transaction.getAllTransaction,
  middlewareResponse.getAllResponse);
router.put('/:transactionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), transaction.updateTransaction,
  middlewareResponse.updateResponse);
router.patch('/:transactionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), transaction.updatePartialTransaction,
  middlewareResponse.updateResponse);
router.delete('/:transactionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), transaction.deleteTransaction,
  middlewareResponse.deleteResponse);

module.exports = router;
