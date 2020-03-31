const express = require('express');

const router = express.Router();
const menuItemTags = require('../controllers/menuItemTags');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for MenuItemTags. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemTags.saveMenuItemTag, middlewareReponse.saveResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemTags.getAllMenuItemTag,
  middlewareReponse.getAllResponse);
router.get('/:menuItemTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemTags.getMenuItemTag, middlewareReponse.getByIdResponse);
router.put('/:menuItemTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemTags.updateMenuItemTag,
  middlewareReponse.updateResponse);
router.patch('/:menuItemTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemTags.updatePartialMenuItemTag,
  middlewareReponse.updateResponse);
router.delete('/:menuItemTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemTags.deleteMenuItemTag,
  middlewareReponse.deleteResponse);

module.exports = router;
