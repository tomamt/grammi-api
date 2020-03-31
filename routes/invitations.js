// Deprecated api route remove in v2

const express = require('express');

const router = express.Router();
/* const jwtAuthz = require('express-jwt-authz');
const invitation = require('../controllers/invitations');
const middlewareReponse = require('../middleware/response');
const jwtValidation = require('../middleware/jwtValidation');
const config = require('../config/config');

const customScopeKey = `${config.api.resourceServerId}/scopes`;
const checkScopes = jwtAuthz(['create:users'], { customScopeKey }); */


/* Redirect to API for userRoles. */
/* router.use(jwtValidation.checkJwt);
router.post('/', invitation.saveInvitation, middlewareReponse.saveResponse);
router.get('/', checkScopes, invitation.getAllInvitation, middlewareReponse.getAllResponse);
router.get('/:invitationId', invitation.getInvitation, middlewareReponse.getByIdResponse);
router.put('/:invitationId', invitation.updateInvitation, middlewareReponse.updateResponse);
router.patch('/:invitationId', invitation.updatePartialInvitation,
middlewareReponse.updateResponse);
router.delete('/:invitationId', invitation.deleteInvitation, middlewareReponse.deleteResponse); */

module.exports = router;
