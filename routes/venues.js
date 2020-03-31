const express = require('express');

const router = express.Router();
const venue = require('../controllers/venues');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];

/* Redirect to API for Venues. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), venue.saveVenue, middlewareReponse.saveResponse);
router.get('/:venueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), venue.getVenue, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess),
  venue.getAllVenue, middlewareReponse.getAllResponse);
router.put('/:venueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), venue.updateVenue, middlewareReponse.updateResponse);
router.patch('/:venueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), venue.updatePartialVenue, middlewareReponse.updateResponse);
router.delete('/:venueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), venue.deleteVenue, middlewareReponse.deleteResponse);

module.exports = router;
