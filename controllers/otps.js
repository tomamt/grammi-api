/**
 * Created by dibeesh on 11/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/otps');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const otpsModel = require('../models/otps');
const Constant = require('../utilities/constant');

const references = Constant.reference.otp;
const otpsService = new ModelService(otpsModel, references);
const otpsApi = {
  saveOtp: async (req, res, next) => {
    res.data = await otpsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving the otp', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getOtp: async (req, res, next) => {
    const otpRes = await otpsService.getById(req.params.otpId);
    if (otpRes) {
      const response = { status: true, otps: otpRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular otp', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateOtp: async (req, res, next) => {
    const obj = { Id: req.params.otpId, data: req.body, options: { runValidators: true } };
    res.data = await otpsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial otp', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialOtp: async (req, res, next) => {
    const obj = { Id: req.params.otpId, data: req.body, options: { runValidators: true } };
    res.data = await otpsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating otp', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteOtp: async (req, res, next) => {
    res.data = await otpsService.deleteRemove(req.params.otpId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting otp', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllOtp: async (req, res, next) => {
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
    const totalCountRes = await otpsService.totalCount();
    const otpRes = await otpsService.getAll(obj);
    if (otpRes) {
      const response = { status: true, totalCount: totalCountRes, otps: otpRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all otp', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = otpsApi;
