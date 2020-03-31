/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable prefer-destructuring */
// Auth0 validations
// const debug = require('debug')('grammi-api:services/auth0');
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const config = require('../config/config');
const constants = require('../utilities/constant');

module.exports = {
  checkJwt: jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      // rateLimit: true,
      // jwksRequestsPerMinute: 5,
      jwksUri: `https://${config.api.auth0Domain}/.well-known/jwks.json`,
    }),
    // Validate the audience and the issuer.
    // audience: 'https://' + config.api.auth0Domain + '/api/v2/',
    // audience: config.api.auth0ClientId,
    // issuer: `https://${config.api.auth0Domain}/`,
    algorithms: ['RS256'],
  }),
  decode(req, res, next) {
    if (req.user) {
      req.userRole = req.user[`${config.api.resourceServerId}/roles`][0];
      req.userId = req.user[`${config.api.resourceServerId}/userId`];
      req.scopes = req.user[`${config.api.resourceServerId}/scopes`];
    }
    next();
  },
  checkRole(role) {
    return (req, res, next) => {
      if (req.userRole === role) return next();
      res.status(403).send(constants.labelList.forbiddenUser);
    };
  },
  checkPermission(permission) {
    return (req, res, next) => {
      /*      const scope = req.scopes;
      console.log('scopes', scope);
      if (scope.includes(permission)) return next();
      res.status(403).send(constants.labelList.forbiddenScope); */
      const scope = req.scopes;
      let forbidden = false;
      permission.forEach((item) => {
        if (scope.includes(item)) {
          forbidden = true;
        }
      });
      if (forbidden) {
        return next();
      }
      // res.status(403).send(constants.labelList.forbiddenScope);
      res.status(403).send({ status: false, error: constants.labelList.forbiddenScope });
    };
  },
};
