const express = require('express');

const router = express.Router();
const noShow = require('../controllers/noshow');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for DiscountCode. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), noShow.saveNoShow, middlewareReponse.saveResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), noShow.getAllNoShow, middlewareReponse.getAllResponse);


module.exports = router;
