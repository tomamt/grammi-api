const express = require('express');

const router = express.Router();
const deviceIds = require('../controllers/deviceIds');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for Venues. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deviceIds.saveDeviceIds, middlewareReponse.saveResponse);
router.get('/:deviceId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deviceIds.getDeviceIds, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deviceIds.getAllDeviceIds, middlewareReponse.getAllResponse);
router.put('/:deviceId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deviceIds.updateDeviceIds, middlewareReponse.updateResponse);
router.patch('/:deviceId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deviceIds.updatePartialDeviceIds,
  middlewareReponse.updateResponse);
router.delete('/:deviceId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), deviceIds.deleteDeviceIds,
  middlewareReponse.deleteResponse);

module.exports = router;
