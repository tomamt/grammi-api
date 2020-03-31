const express = require('express');

const router = express.Router();
const menuItemAvailableHours = require('../controllers/menuItemAvailableHours');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for MenuItemAvailableHours. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.saveMenuItemAvailableHour,
  middlewareReponse.saveResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.getAllMenuItemAvailableHour,
  middlewareReponse.getAllResponse);
router.get('/:menuItemAvailableHourId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.getMenuItemAvailableHour,
  middlewareReponse.getByIdResponse);
router.put('/:menuItemAvailableHourId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.updateMenuItemAvailableHour,
  middlewareReponse.updateResponse);
router.patch('/:menuItemAvailableHourId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.updatePartialMenuItemAvailableHour,
  middlewareReponse.updateResponse);
router.delete('/:menuItemAvailableHourId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.deleteMenuItemAvailableHour,
  middlewareReponse.deleteResponse);
router.delete('/menuItem/:menuItemId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), menuItemAvailableHours.deleteMenuItemHours,
  middlewareReponse.deleteResponse);
module.exports = router;
