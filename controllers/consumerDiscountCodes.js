/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable max-len */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/consumerDiscountCodes');
require('express-async-errors');
const createError = require('http-errors');
const ModelService = require('../services/referencedModelService');
const consumerDiscountCodesModel = require('../models/consumerDiscountCodes');
const discountCodesModel = require('../models/discountCodes');
const Constant = require('../utilities/constant');

const consumerDiscountCodeReferences = Constant.reference.consumerDiscountCode;
const discountCodeReferences = Constant.reference.discountCode;
const discountCodesService = new ModelService(discountCodesModel, discountCodeReferences);
const consumerDiscountCodesService = new ModelService(consumerDiscountCodesModel, consumerDiscountCodeReferences);
const ConsumerDiscountCodesApi = {
  saveConsumerDiscountCode: async (req, res, next) => {
    const query = {
      $and: [
        { recipientId: req.body.recipientId },
        { discountCodeId: req.body.discountCodeId },
      ],
    };
    const recipientRes = await consumerDiscountCodesService.getByCustomField(query);
    const discountCodeRes = await discountCodesService.getById(req.body.discountCodeId);

    if (recipientRes && discountCodeRes) {
      discountCodesCount = discountCodeRes.usageLimit;
      if (recipientRes.length < discountCodesCount) {
        res.data = await consumerDiscountCodesService.save(req.body);
        if (res.data) {
          next();
        } else {
          debug('Error Occured while adding data to Consumer discount code', httpContext.get('requestId'));
          throw new Error();
        }
      } else {
        debug('Error Occured for the same Coupon reaching Maximum Limit', httpContext.get('requestId'));
        errorRes = createError(422, Constant.labelList.maxLimitOfCoupon);
        return next(errorRes);
      }
    }
  },
  getConsumerDiscountCode: async (req, res, next) => {
    const consumerDiscountCodesRes = await consumerDiscountCodesService.getById(req.params.consumerDiscountCodeId);
    if (consumerDiscountCodesRes) {
      const response = { status: true, consumerDiscountCodes: consumerDiscountCodesRes };
      res.data = response;
      next();
    } else {
      debug('Error Occured while fetching particular data from Consumer discount code', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateConsumerDiscountCode: async (req, res, next) => {
    const obj = { Id: req.params.consumerDiscountCodeId, data: req.body, options: { runValidators: true } };
    res.data = await consumerDiscountCodesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while updating data to Consumer discount code', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDiscountCode: async (req, res, next) => {
    const obj = { Id: req.params.discontCodeId, data: req.body, options: { runValidators: true } };
    res.data = await discountCodesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while updating partial data to Consumer discount code', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDiscountCode: async (req, res, next) => {
    res.data = await discountCodesService.deleteRemove(req.params.discontCodeId);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while deleting data from Consumer discount code', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllConsumerDiscountCode: async (req, res, next) => {
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
    const totalCountRes = await consumerDiscountCodesService.totalCount();
    const discountCodesRes = await consumerDiscountCodesService.getAll(obj);
    if (discountCodesRes) {
      const response = { status: true, totalCount: totalCountRes, discountCodes: discountCodesRes };
      res.data = response;
      next();
    } else {
      debug('Error Occured while fetching all data from Consumer discount code', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = ConsumerDiscountCodesApi;
