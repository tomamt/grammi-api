/**
 * Created by dibeesh on 11/11/19.
 */

// Deprecated remove in v2
const express = require('express');

const router = express.Router();
// const otp = require('../controllers/otps');
// const middlewareReponse = require('../middleware/response');

/* Redirect to API for OTPs. */
/* router.post('/', otp.saveOtp, middlewareReponse.saveResponse);
router.get('/:otpId', otp.getOtp, middlewareReponse.getByIdResponse);
router.get('/', otp.getAllOtp, middlewareReponse.getAllResponse);
router.put('/:otpId', otp.updateOtp, middlewareReponse.updateResponse);
router.patch('/:otpId', otp.updatePartialOtp, middlewareReponse.updateResponse);
router.delete('/:otpId', otp.deleteOtp, middlewareReponse.deleteResponse); */

module.exports = router;
