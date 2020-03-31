/* eslint-disable max-len */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/deviceIds');
require('express-async-errors');
const ModelService = require('../services/modelService');
const deviceIdsModel = require('../models/deviceIds');

const deviceIdsService = new ModelService(deviceIdsModel);
const DeviceIdsApi = {
  saveDeviceIds: async (req, res, next) => {
    const deviceIdQuery = {
      query: { deviceId: req.body.deviceId, firebaseToken: req.body.firebaseToken },
      data: {
        deviceId: req.body.deviceId, userId: req.body.userId, firebaseToken: req.body.firebaseToken, deviceType: req.body.deviceType,
      },
      options: { upsert: true },
    };
    res.data = await deviceIdsService.updateCustomField(deviceIdQuery);
    if (res.data) {
      next();
    } else {
      debug('Error occured while adding deviceIds', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDeviceIds: async (req, res, next) => {
    const venueRes = await deviceIdsService.getById(req.params.deviceId);
    if (venueRes) {
      const response = { status: true, deviceIds: venueRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching particular deviceIds details', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDeviceIds: async (req, res, next) => {
    const obj = { Id: req.params.deviceId, data: req.body, options: { runValidators: true } };
    res.data = await deviceIdsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating deviceIds data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDeviceIds: async (req, res, next) => {
    const obj = { Id: req.params.deviceId, data: req.body, options: { runValidators: true } };
    res.data = await deviceIdsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating partial deviceIds data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDeviceIds: async (req, res, next) => {
    res.data = await deviceIdsService.deleteRemove(req.params.deviceId);
    if (res.data) {
      next();
    } else {
      debug('Error occured while deleting deviceIds', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDeviceIds: async (req, res, next) => {
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
    const totalCountRes = await deviceIdsService.totalCount();
    const venueRes = await deviceIdsService.getAll(obj);
    if (venueRes) {
      const response = { status: true, totalCount: totalCountRes, deviceIds: venueRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching all deviceIds details', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = DeviceIdsApi;
