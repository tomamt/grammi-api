/**
 * Created by dibeesh on 18/11/19.
 */
const express = require('express');

const router = express.Router();
const rating = require('../controllers/ratings');
const middlewareResponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for Rating. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), rating.saveRating, middlewareResponse.saveResponse);
router.get('/:ratingId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), rating.getRating, middlewareResponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), rating.getAllRating, middlewareResponse.getAllResponse);
router.put('/:ratingId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), rating.updateRating, middlewareResponse.updateResponse);
router.patch('/:ratingId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), rating.updatePartialRating, middlewareResponse.updateResponse);
router.delete('/:ratingId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), rating.deleteRating, middlewareResponse.deleteResponse);

module.exports = router;
