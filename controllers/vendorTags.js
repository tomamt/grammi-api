const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/VendorTag');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const vendorTagsModel = require('../models/vendorTags');
const Constant = require('../utilities/constant');

const references = Constant.reference.vendorTag;
const vendorTagsService = new ModelService(vendorTagsModel, references);
const VendorTagsApi = {
  saveVendorTag: async (req, res, next) => {
    let exist = false;
    const query = { vendorId: req.body.vendorId };
    const vendorTagList = await vendorTagsService.getByCustomField({ query });
    await vendorTagList.forEach(async (element) => {
      if (element.name === req.body.name) {
        exist = true;
      }
    });
    if (exist === false) {
      res.data = await vendorTagsService.save(req.body);
      if (res.data) {
        next();
      } else {
        debug('Error while saving vendor tag', httpContext.get('requestId'));
        throw new Error();
      }
    } else {
      debug('Vendor Tag already exist', httpContext.get('requestId'));
      res.data = { status: true, _id: Constant.labelList.vendorTagExist };
      next();
      // throw new Error(Constant.labelList.vendorTagExist);
    }
  },
  getVendorTag: async (req, res, next) => {
    const Id = req.params.vendorTagId;
    const vendorTagsRes = await vendorTagsService.getById(Id);
    if (vendorTagsRes) {
      const response = { status: true, vendorTags: vendorTagsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular vendor tag', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllVendorTag: async (req, res, next) => {
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
    const totalCountRes = await vendorTagsService.totalCount();
    const vendorTagsRes = await vendorTagsService.getAll(obj);
    if (vendorTagsRes) {
      const response = { status: true, totalCount: totalCountRes, vendorTags: vendorTagsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all vendor tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateVendorTag: async (req, res, next) => {
    const obj = { Id: req.params.vendorTagId, data: req.body, options: { runValidators: true } };
    res.data = await vendorTagsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating vendor tag', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialVendorTag: async (req, res, next) => {
    const obj = { Id: req.params.vendorTagId, data: req.body, options: { runValidators: true } };
    res.data = await vendorTagsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial vendor tag', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteVendorTag: async (req, res, next) => {
    const Id = req.params.vendorTagId;
    res.data = await vendorTagsService.deleteRemove(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting vendor tag', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorTagForVendor: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
      query: { vendorId: req.params.vendorId },
    };
    const totalCountRes = await vendorTagsService.totalCount(obj);
    const vendorTagsRes = await vendorTagsService.getAll(obj);
    if (vendorTagsRes) {
      const response = { status: true, totalCount: totalCountRes, vendorTags: vendorTagsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing vendor tag for vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = VendorTagsApi;
