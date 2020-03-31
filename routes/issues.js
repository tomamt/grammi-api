const express = require('express');

const router = express.Router();
const issues = require('../controllers/issues');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for issues. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), issues.saveIssues, middlewareReponse.saveResponse);
router.get('/:issueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), issues.getIssues, middlewareReponse.getByIdResponse);
router.get('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), issues.getAllIssues, middlewareReponse.getAllResponse);
router.put('/:issueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), issues.updateIssues, middlewareReponse.updateResponse);
router.patch('/:issueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), issues.updatePartialIssues, middlewareReponse.updateResponse);
router.delete('/:issueId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), issues.deleteIssues, middlewareReponse.deleteResponse);

module.exports = router;
