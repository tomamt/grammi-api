const express = require('express');

const router = express.Router();
const userRole = require('../controllers/userRoles');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];


/* Redirect to API for userRoles. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), userRole.saveUserRole, middlewareReponse.saveResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), userRole.getAllUserRole, middlewareReponse.getAllResponse);
router.get('/:userRoleId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), userRole.getUserRole, middlewareReponse.getByIdResponse);
router.put('/:userRoleId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), userRole.updateUserRole, middlewareReponse.updateResponse);
router.patch('/:userRoleId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), userRole.updatePartialUserRole,
  middlewareReponse.updateResponse);
router.delete('/:userRoleId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), userRole.deleteUserRole, middlewareReponse.deleteResponse);

module.exports = router;
