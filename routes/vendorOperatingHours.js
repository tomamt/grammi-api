const express = require('express');

const router = express.Router();
const vendorOperatingHours = require('../controllers/vendorOperatingHours');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

/* Redirect to API for vendorOperatingHours. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorOperatingHours.saveVendorOperatingHours,
  middlewareReponse.saveResponse);
router.get('/:vendorOperatingHoursId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorOperatingHours.getVendorOperatingHours,
  middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorOperatingHours.getAllVendorOperatingHours,
  middlewareReponse.getAllResponse);
router.put('/:vendorOperatingHoursId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorOperatingHours.updateVendorOperatingHours,
  middlewareReponse.updateResponse);
router.patch('/:vendorOperatingHoursId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorOperatingHours.updatePartialVendorOperatingHours,
  middlewareReponse.updateResponse);
router.delete('/:vendorOperatingHoursId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorOperatingHours.deleteVendorOperatingHours,
  middlewareReponse.deleteResponse);

module.exports = router;
