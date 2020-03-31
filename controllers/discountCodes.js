const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/discountCodes');
require('express-async-errors');
const ModelService = require('../services/modelService');
const discountCodesModel = require('../models/discountCodes');

const discountCodesService = new ModelService(discountCodesModel);
const DiscountCodesApi = {
  saveDiscountCode: async (req, res, next) => {
    res.data = await discountCodesService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error occured while adding discount codes', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDiscountCode: async (req, res, next) => {
    const discountCodesRes = await discountCodesService.getById(req.params.discontCodeId);
    if (discountCodesRes) {
      const response = { status: true, discountCodes: discountCodesRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching particular discount codes', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDiscountCode: async (req, res, next) => {
    const obj = { Id: req.params.discontCodeId, data: req.body, options: { runValidators: true } };
    res.data = await discountCodesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating discount codes', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDiscountCode: async (req, res, next) => {
    const obj = { Id: req.params.discontCodeId, data: req.body, options: { runValidators: true } };
    res.data = await discountCodesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating partial discount codes', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDiscountCode: async (req, res, next) => {
    res.data = await discountCodesService.deleteRemove(req.params.discontCodeId);
    if (res.data) {
      next();
    } else {
      debug('Error occured while deleting discount codes', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDiscountCode: async (req, res, next) => {
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
    const totalCountRes = await discountCodesService.totalCount();
    const discountCodesRes = await discountCodesService.getAll(obj);
    if (discountCodesRes) {
      const response = { status: true, totalCount: totalCountRes, discountCodes: discountCodesRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching all discount codes', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = DiscountCodesApi;
