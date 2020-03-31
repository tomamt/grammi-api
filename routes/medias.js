const express = require('express');

const router = express.Router();
const medias = require('../controllers/medias');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for Venues. */
router.post('/signature', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), medias.generateUploadPolicy);
router.post('/upload', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), medias.uploadFile);

router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), medias.saveMedia, middlewareReponse.saveResponse);
router.get('/:mediaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), medias.getMedia, middlewareReponse.getByIdResponse);
router.put('/:mediaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), medias.updateMedia, middlewareReponse.updateResponse);
router.delete('/:mediaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), medias.deleteMedia, middlewareReponse.deleteResponse);

module.exports = router;
