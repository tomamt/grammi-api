const express = require('express');

const router = express.Router();
const vendorMenuSections = require('../controllers/vendorMenuSections');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

/* Redirect to API for VendorMenuSection. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.saveVendorMenuSection,
  middlewareReponse.saveResponse);
router.get('/:vendorMenuSectionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.getVendorMenuSection,
  middlewareReponse.getByIdResponse);
router.get('/', vendorMenuSections.getAllVendorMenuSection, middlewareReponse.getAllResponse);
router.get('/vendors/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.getAllVendorMenuSectionByVendor,
  middlewareReponse.getAllResponse);
router.put('/:vendorMenuSectionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.updateVendorMenuSection,
  middlewareReponse.updateResponse);
router.patch('/:vendorMenuSectionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.updatePartialVendorMenuSection,
  middlewareReponse.updateResponse);
router.patch('/delete/:vendorMenuSectionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.deleteMenuVendorMenuSection,
  middlewareReponse.updateResponse);
router.delete('/:vendorMenuSectionId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.deleteVendorMenuSection,
  middlewareReponse.deleteResponse);
router.get('/menu/:menuId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), vendorMenuSections.getVendorMenuDetails,
  middlewareReponse.getByIdResponse);
module.exports = router;
