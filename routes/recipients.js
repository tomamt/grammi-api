/**
 * Created by dibeesh on 12/11/19.
 */
const express = require('express');

const router = express.Router();
const recipient = require('../controllers/recipients');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), recipient.saveRecipient, middlewareReponse.saveResponse);
router.get('/:recipientId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), recipient.getRecipient, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), recipient.getAllRecipient, middlewareReponse.getAllResponse);
router.put('/:recipientId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), recipient.updateRecipient, middlewareReponse.updateResponse);
router.patch('/:recipientId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), recipient.updatePartialRecipient,
  middlewareReponse.updateResponse);
router.delete('/:recipientId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), recipient.deleteRecipient,
  middlewareReponse.deleteResponse);

module.exports = router;
