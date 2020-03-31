const express = require('express');

const router = express.Router();
const deliveryAgents = require('../controllers/deliveryAgentsWorkingHours');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];

/* Redirect to API for DeliveryAgents. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.agentClockInLog, middlewareReponse.saveResponse);
router.patch('/:deliveryAgentsWorkingHourId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.agentClockOutLog,
  middlewareReponse.updateResponse);
router.get('/:deliveryAgentId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAgents.getWorkingHoursHistoryForDA,
  middlewareReponse.getAllResponse);
module.exports = router;
