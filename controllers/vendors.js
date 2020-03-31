const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/vendors');
const ModelService = require('../services/referencedModelService');
const vendorsModel = require('../models/vendors');
const Constant = require('../utilities/constant');

const references = Constant.reference.vendor;
const vendorService = new ModelService(vendorsModel, references);

const VendorsApi = {
  saveVendor: async (req, res, next) => {
    res.data = await vendorService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendor: async (req, res, next) => {
    const Id = req.params.vendorId;
    const vendorRes = await vendorService.getById(Id);
    if (vendorRes) {
      const response = { status: true, vendors: vendorRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateVendor: async (req, res, next) => {
    const obj = { Id: req.params.vendorId, data: req.body, options: { runValidators: true } };
    res.data = await vendorService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialVendor: async (req, res, next) => {
    const obj = { Id: req.params.vendorId, data: req.body, options: { runValidators: true } };
    res.data = await vendorService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteVendor: async (req, res, next) => {
    const Id = req.params.vendorId;
    res.data = await vendorService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllVendor: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    if ((req.query.pageSize === undefined || req.query.pageNo === undefined) && req.query.list === 'all') {
      req.query.pageSize = '';
      req.query.pageNo = '';
    }
    if (req.query.pageSize === undefined || req.query.pageNo === undefined) {
      req.query.pageSize = 10;
      req.query.pageNo = 1;
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
    /* if (req.userRole === 'vendor') {
      obj.query = { userId: req.userId };
    } */
    const totalCountRes = await vendorService.totalCount(obj);
    const vendorRes = await vendorService.getAll(obj);
    if (vendorRes) {
      const response = { status: true, totalCount: totalCountRes, vendors: vendorRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all vendors', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = VendorsApi;
