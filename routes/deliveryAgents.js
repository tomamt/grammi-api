const express = require('express');

const router = express.Router();
const deliveryAgents = require('../controllers/deliveryAgents');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessDelete = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for deliveryAgent. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.saveDeliveryAgent,
  middlewareReponse.saveResponse);
router.get('/:userId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.getDeliveryAgent,
  middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.getAllDeliveryAgent,
  middlewareReponse.getAllResponse);
router.put('/:deliveryAgentId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.updateDeliveryAgent,
  middlewareReponse.updateResponse);
router.patch('/:deliveryAgentId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.updatePartialDeliveryAgent,
  middlewareReponse.updateResponse);
router.delete('/:deliveryAgentId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessDelete), deliveryAgents.deleteDeliveryAgent,
  middlewareReponse.deleteResponse);

module.exports = router;
