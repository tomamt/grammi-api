const express = require('express');

const router = express.Router();
const defaultTags = require('../controllers/defaultTags');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

// const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor'];

/* Redirect to API for default tags. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), defaultTags.saveDefaultTag, middlewareReponse.saveResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), defaultTags.listDefaultTag, middlewareReponse.getAllResponse);
router.put('/:defaultTagId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), defaultTags.updateDefaultTag, middlewareReponse.updateResponse);

module.exports = router;
