const express = require('express');

const router = express.Router();
const user = require('../controllers/users');
const middlewareReponse = require('../middleware/response');
const customValidation = require('../middleware/customValidations');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor'];

router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), customValidation.crewValidation, user.saveUser,
  middlewareReponse.saveResponse);
router.get('/:userId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), user.getUser, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), user.getAllUser, middlewareReponse.getAllResponse);
router.put('/:userId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), user.updateUser, middlewareReponse.updateResponse);
router.patch('/:userId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), user.updatePartialUser, middlewareReponse.updateResponse);
router.delete('/:userId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), user.deleteUser, middlewareReponse.deleteResponse);

module.exports = router;
