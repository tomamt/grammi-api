const express = require('express');

const router = express.Router();
const vendorTags = require('../controllers/vendorTags');
const middlewareReponse = require('../middleware/response');

const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for VendorTag. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.saveVendorTag, middlewareReponse.saveResponse);
router.get('/:vendorTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.getVendorTag, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.getAllVendorTag, middlewareReponse.getAllResponse);
router.get('/vendors/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.getVendorTagForVendor,
  middlewareReponse.getAllResponse);
router.put('/:vendorTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.updateVendorTag, middlewareReponse.updateResponse);
router.patch('/:vendorTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.updatePartialVendorTag,
  middlewareReponse.updateResponse);
router.delete('/:vendorTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorTags.deleteVendorTag, middlewareReponse.deleteResponse);

module.exports = router;
