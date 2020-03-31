const express = require('express');

const router = express.Router();
const carts = require('../controllers/carts');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for Carts */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), carts.saveCart, middlewareReponse.saveResponse);
router.get('/:cartsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), carts.getCart, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), carts.getAllCart, middlewareReponse.getAllResponse);
router.put('/:cartsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), carts.updateCart, middlewareReponse.updateResponse);
router.patch('/:cartsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), carts.updatePartialCart, middlewareReponse.updateResponse);
router.delete('/:cartsId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), carts.deleteCart, middlewareReponse.deleteResponse);
module.exports = router;
