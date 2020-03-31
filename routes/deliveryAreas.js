/**
 * Created by dibeesh on 20/11/19.
 */
const express = require('express');

const router = express.Router();
const deliveryAreas = require('../controllers/deliveryAreas');
const middlewareReponse = require('../middleware/response');
const jwt = require('../middleware/jwtValidation');

const roleAccess = ['all:superAdmin', 'all:admin', 'all:daManager', 'all:vendor', 'all:deliveryAgent', 'all:crew'];
const roleAccessPrime = ['all:superAdmin', 'all:admin', 'all:daManager'];
/* Redirect to API for deliveryAreas. */
router.post('/', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), deliveryAreas.saveDeliveryArea,
  middlewareReponse.saveResponse);
router.get('/:deliveryAreaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAreas.getDeliveryArea,
  middlewareReponse.getByIdResponse);
router.get('/', deliveryAreas.getAllDeliveryArea, middlewareReponse.getAllResponse);
router.put('/:deliveryAreaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAreas.updateDeliveryArea,
  middlewareReponse.updateResponse);
router.patch('/:deliveryAreaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccess), deliveryAreas.updatePartialDeliveryArea,
  middlewareReponse.updateResponse);
router.delete('/:deliveryAreaId', jwt.checkJwt, jwt.decode,
  jwt.checkPermission(roleAccessPrime), deliveryAreas.deleteDeliveryArea,
  middlewareReponse.deleteResponse);
module.exports = router;
