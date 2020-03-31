/* eslint-disable no-unused-vars */
// const debug = require('debug')('grammi-api:controllers/invitations');

const createError = require('http-errors');
const { body, check, validationResult } = require('express-validator');

const customValidations = {
  crewValidation: (req, res, next) => {
    let errorRes;
    if (req.body.userRole === 'crew') {
      req.vendorId = req.body.vendorId;
      if (!req.vendorId) {
        errorRes = createError(403, 'Required VendorId');
        throw new Error(errorRes);
      } else {
        next();
      }
    } else {
      next();
    }
  },
  ruleCreateRecipient: () => [
    check('phoneNumber')
      .exists()
      .withMessage('Required phoneNumber')
      .isNumeric()
      .withMessage('Must be only numeric chars'),
    check('deviceId')
      .exists()
      .withMessage('Required deviceId'),
    check('firebaseToken')
      .exists()
      .withMessage('Required Firebase Token'),
  ],
  ruleVerifyOtp: () => [
    check('phoneNumber')
      .exists()
      .withMessage('Required phoneNumber')
      .isNumeric()
      .withMessage('Must be only numeric chars'),
    check('otp')
      .exists()
      .withMessage('Required otp'),
    check('deviceId')
      .exists()
      .withMessage('Required deviceId'),
  ],
  GetOrder: () => [
    check('paymentIntentId')
      .exists()
      .withMessage('Required paymentIntentId'),
  ],
  ruleOrderStatusChange: () => [
    check('status')
      .exists()
      .withMessage('Required status')
      .isIn(['placed', 'confirmed', 'ready', 'onroute', 'delivered', 'cancelled'])
      .withMessage('Invalid status'),
    check('cancellationReasonId')
      .exists()
      .withMessage('Required cancellationReasonId'),
  ],
  ruleRating: () => [
    check('experienceRating')
      .exists()
      .withMessage('Required experienceRating'),
    check('experienceRating')
      .isIn([1, 2, 3, 4, 5])
      .withMessage('Invalid experienceRating value'),

  ],
  validate: (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
    return res.status(422).json({
      status: false,
      errors: extractedErrors,
    });
  },

};
module.exports = customValidations;
