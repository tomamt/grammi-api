const express = require('express');
const vendors = require('../controllers/vendors');
const middlewareReponse = require('../middleware/response');

const router = express.Router();

const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), vendors.saveVendor, middlewareReponse.saveResponse);
router.get('/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendors.getVendor, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendors.getAllVendor, middlewareReponse.getAllResponse);
router.put('/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendors.updateVendor, middlewareReponse.updateResponse);
router.patch('/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendors.updatePartialVendor, middlewareReponse.updateResponse);
router.delete('/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), vendors.deleteVendor, middlewareReponse.deleteResponse);

module.exports = router;
