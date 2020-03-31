/* eslint-disable import/order */
/**
 * Created by dibeesh on 12/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:services/twillio');
const createError = require('http-errors');
const constant = require('../utilities/constant');
const config = require('../config/config');
const client = require('twilio')(config.api.twillioAccountSid, config.api.twillioAuthToken);

const twillioService = {
  createMessage: async (data) => new Promise((resolve, reject) => {
    // console.log('send sms', config.api.twillioAccountSid);
    client.messages
      .create({ body: data.message, from: data.from, to: data.to })
      .then((message) => {
        // console.log(message.sid);
        resolve(message);
      })
      .catch((err) => {
        // console.log('error', err);
        reject(err);
      });
  }),
  createVerification: async (data) => new Promise((resolve, reject) => {
    let errorRes;
    const to = `+${data.phoneNumber}`;
    // console.log('createVerificationMessage', data, to);
    client.verify.services(config.api.twillioServiceId)
      .verifications
      .create({ to, channel: 'sms' })
      .then((verification) => {
        resolve(verification);
      })
      .catch((err) => {
        debug(`createVerification error ${err}`, httpContext.get('requestId'));
        if (err.status === '429') {
          debug('ratelimit error in createVerification', httpContext.get('requestId'));
          errorRes = createError(err.status, constant.errorName.rateLimit);
          reject(errorRes);
        } else if (err.status === 400) {
          debug('Invalid number in createVerification', httpContext.get('requestId'));
          errorRes = createError(err.status, constant.errorName.invalidNumber);
          reject(errorRes);
        } else {
          reject(err);
        }
      });
  }),
  checkVerification: async (data) => new Promise((resolve, reject) => {
    let errorRes;
    const to = `+${data.phoneNumber}`;
    // console.log('check verification', data, to, config.api.twillioServiceId);
    client.verify.services(config.api.twillioServiceId)
      .verificationChecks
      .create({ to, code: data.otp })
      .then((verificationCheck) => {
        // console.log('verification res', verificationCheck);
        resolve(verificationCheck);
      })
      .catch((err) => {
        debug(`check verification error ${err}`, httpContext.get('requestId'));
        // console.log('createVerification error', err);
        if (err.code === 20404) {
          debug('createVerification error', httpContext.get('requestId'));
          errorRes = createError(err.status, constant.errorName.invalidOtp);
          reject(errorRes);
        } else {
          reject(err);
        }
      });
  }),
};
module.exports = twillioService;
