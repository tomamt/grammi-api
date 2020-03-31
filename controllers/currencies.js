const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/Currencies');
require('express-async-errors');
const ModelService = require('../services/modelService');
const currenciesModel = require('../models/currencies');

const currenciesService = new ModelService(currenciesModel);
const CurrenciesApi = {
  saveCurrencies: async (req, res, next) => {
    res.data = await currenciesService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving currency', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getCurrencies: async (req, res, next) => {
    const Id = req.params.currencyId;
    const currenciesRes = await currenciesService.getById(Id);
    if (currenciesRes) {
      const response = { status: true, currencies: currenciesRes };
      res.data = response;
      next();
    } else {
      debug('Error while fetching particular currency list', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllCurrencies: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
    };
    const totalCountRes = await currenciesService.totalCount();
    const currenciesRes = await currenciesService.getAll(obj);
    if (currenciesRes) {
      const response = { status: true, totalCount: totalCountRes, currencies: currenciesRes };
      res.data = response;
      next();
    } else {
      debug('Error while fetching all currency list', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateCurrencies: async (req, res, next) => {
    const obj = { Id: req.params.currencyId, data: req.body, options: { runValidators: true } };
    res.data = await currenciesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating data in currency', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialCurrencies: async (req, res, next) => {
    const obj = { Id: req.params.currencyId, data: req.body, options: { runValidators: true } };
    res.data = await currenciesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial data in currency', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteCurrencies: async (req, res, next) => {
    const Id = req.params.dropdownId;
    res.data = await currenciesService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting data in currency', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = CurrenciesApi;
