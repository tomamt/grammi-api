const express = require('express');

const router = express.Router();
const dropdowns = require('../controllers/dropdowns');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for Dropdwon. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), dropdowns.saveDropdown, middlewareReponse.saveResponse);
router.get('/:dropdownId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), dropdowns.getDropdown, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), dropdowns.getAllDropdown, middlewareReponse.getAllResponse);
router.put('/:dropdownId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), dropdowns.updateDropdown, middlewareReponse.updateResponse);
router.patch('/:dropdownId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), dropdowns.updatePartialDropdown,
  middlewareReponse.updateResponse);
router.delete('/:dropdownId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), dropdowns.deleteDropdown, middlewareReponse.deleteResponse);

module.exports = router;
