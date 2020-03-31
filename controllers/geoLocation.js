/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/geoLocation');
require('express-async-errors');
const moment = require('moment');
const createError = require('http-errors');
const ModelService = require('../services/referencedModelService');
const geoLocationModel = require('../models/geoLocation');
const Constant = require('../utilities/constant');

const geoLocationReferences = Constant.reference.geoLocation;
const geoLocationService = new ModelService(geoLocationModel, geoLocationReferences);

const geoLocationApi = {
  saveGeoLocation: async (req, res, next) => {
    const requestVal = req.body.locationRequests;
    const data = await geoLocationService.saveMultipleData(requestVal);
    if (data.length === requestVal.length) {
      res.data = {
        status: true,
        message: Constant.labelList.insertSuccess,
      };
      next();
    } else {
      debug('Error occured while adding geo location', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getGeoLocation: async (req, res, next) => {
    const geoLocationRes = await geoLocationService.getById(req.params.geoLocationId);
    if (geoLocationRes) {
      const response = { status: true, geoLocation: geoLocationRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching particular geo location data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateGeoLocation: async (req, res, next) => {
    const obj = { Id: req.params.geoLocationId, data: req.body, options: { runValidators: true } };
    res.data = await geoLocationService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating geo location', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteGeoLocation: async (req, res, next) => {
    res.data = await geoLocationService.deleteRemove(req.params.geoLocationId);
    if (res.data) {
      next();
    } else {
      debug('Error occured while deleting geo location', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllGeoLocation: async (req, res, next) => {
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
    const totalCountRes = await geoLocationService.totalCount();
    const geoLocationRes = await geoLocationService.getAll(obj);
    if (geoLocationRes) {
      const response = { status: true, totalCount: totalCountRes, geoLocation: geoLocationRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching all geo location data', httpContext.get('requestId'));
      throw new Error();
    }
  },
};

module.exports = geoLocationApi;
