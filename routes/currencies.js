// Route deprecated remove in v2

const express = require('express');

const router = express.Router();
/* const currencies = require('../controllers/currencies');
const middlewareReponse = require('../middleware/response');

/!* Redirect to API for Venues. *!/
 router.post('/', currencies.saveCurrencies, middlewareReponse.saveResponse);
router.get('/', currencies.getAllCurrencies, middlewareReponse.getAllResponse);
router.get('/:currencyId', currencies.getCurrencies, middlewareReponse.getByIdResponse);
router.put('/:currencyId', currencies.updateCurrencies, middlewareReponse.updateResponse);
router.patch('/:currencyId', currencies.updatePartialCurrencies, middlewareReponse.updateResponse);
router.delete('/:currencyId', currencies.deleteCurrencies, middlewareReponse.deleteResponse); */

module.exports = router;
