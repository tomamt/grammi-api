const express = require('express');

const router = express.Router();
const geoLocation = require('../controllers/geoLocation');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for DiscountCode. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), geoLocation.saveGeoLocation, middlewareReponse.saveResponse);
router.get('/:geoLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), geoLocation.getGeoLocation, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), geoLocation.getAllGeoLocation, middlewareReponse.getAllResponse);
router.put('/:geoLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), geoLocation.updateGeoLocation, middlewareReponse.updateResponse);
router.delete('/:geoLocationId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), geoLocation.deleteGeoLocation,
  middlewareReponse.deleteResponse);

module.exports = router;
