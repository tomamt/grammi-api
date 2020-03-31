const express = require('express');

const router = express.Router();
const menuItems = require('../controllers/menuItems');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
/* Redirect to API for MenuItem. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.saveMenuItem, middlewareReponse.saveResponse);
router.get('/:menuItemId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.getMenuItem, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.getAllMenuItem, middlewareReponse.getAllResponse);
router.get('/vendors/:vendorId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.getVendorMenuItem, middlewareReponse.getAllResponse);
router.put('/:menuItemId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.updateMenuItem, middlewareReponse.updateResponse);
router.patch('/:menuItemId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.updatePartialMenuItem,
  middlewareReponse.updateResponse);
router.delete('/:menuItemId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItems.deleteMenuItem, middlewareReponse.deleteResponse);

module.exports = router;
