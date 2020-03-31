const express = require('express');

const router = express.Router();
const deliveryLocations = require('../controllers/deliveryLocations');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for DeliveryLocations. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), deliveryLocations.saveDeliveryLocation,
  middlewareReponse.saveResponse);
router.get('/:deliveryLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryLocations.getDeliveryLocation,
  middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryLocations.getAllDeliveryLocation,
  middlewareReponse.getAllResponse);
router.put('/:deliveryLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryLocations.updateDeliveryLocation,
  middlewareReponse.updateResponse);
router.patch('/:deliveryLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryLocations.updatePartialDeliveryLocation,
  middlewareReponse.updateResponse);
router.delete('/:deliveryLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), deliveryLocations.deleteDeliveryLocation,
  middlewareReponse.deleteResponse);
module.exports = router;
