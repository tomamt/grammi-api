const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/vendorOperatingHours');
require('express-async-errors');
// eslint-disable-next-line import/no-extraneous-dependencies
// const Moment = require('moment');
const ModelService = require('../services/modelService');
const vendorOperatingHoursModel = require('../models/vendorOperatingHours');

const vendorOperatingHoursService = new ModelService(vendorOperatingHoursModel);
const VendorOperatingHoursApi = {
  saveVendorOperatingHours: async (req, res, next) => {
    res.data = await vendorOperatingHoursService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving vendor operating hours', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorOperatingHours: async (req, res, next) => {
    const vendorOperatingHoursRes = await vendorOperatingHoursService
      .getById(req.params.vendorOperatingHoursId);

    if (vendorOperatingHoursRes) {
      const response = { status: true, vendorOperatingHours: vendorOperatingHoursRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing vendor operating hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateVendorOperatingHours: async (req, res, next) => {
    const obj = {
      Id: req.params.vendorOperatingHoursId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await vendorOperatingHoursService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating vendor operating hours', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialVendorOperatingHours: async (req, res, next) => {
    const obj = {
      Id: req.params.vendorOperatingHoursId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await vendorOperatingHoursService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial vendor operating hours', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteVendorOperatingHours: async (req, res, next) => {
    res.data = await vendorOperatingHoursService.deleteRemove(req.params.vendorOperatingHoursId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting vendor operating hours', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllVendorOperatingHours: async (req, res, next) => {
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
    if (req.query.filterColumn && req.query.filterValue) {
      obj.query = { [req.query.filterColumn]: req.query.filterValue };
    }
    const totalCountRes = await vendorOperatingHoursService.totalCount(obj);
    const vendorOperatingHoursRes = await vendorOperatingHoursService.getAll(obj);
    if (vendorOperatingHoursRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        vendorOperatingHours: vendorOperatingHoursRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error while listing all vendor operating hours', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = VendorOperatingHoursApi;
