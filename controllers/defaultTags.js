/* eslint-disable no-console */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/defaultTags');
require('express-async-errors');
const ModelService = require('../services/modelService');

const defaultTagsModel = require('../models/defaultTags');
const vendorTagsModel = require('../models/vendorTags');

const defaultTagService = new ModelService(defaultTagsModel);
const vendorTagService = new ModelService(vendorTagsModel);
const defaultTagsApi = {
  saveDefaultTag: async (req, res, next) => {
    try {
      res.data = await defaultTagService.save(req.body);
    } catch (error) {
      debug(`error in save default tags ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  listDefaultTag: async (req, res, next) => {
    try {
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
      const totalCountRes = await defaultTagService.totalCount();
      const defaultTagRes = await defaultTagService.getAll(obj);
      if (defaultTagRes) {
        const response = { status: true, totalCount: totalCountRes, defaultTags: defaultTagRes };
        res.data = response;
      }
    } catch (error) {
      debug(`error in listing common tags ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updateDefaultTag: async (req, res, next) => {
    try {
      const obj = { Id: req.params.defaultTagId, data: req.body, options: { runValidators: true } };
      const vendorTagObj = {
        query: { defaultTagId: req.params.defaultTagId },
        data: req.body,
        options: { runValidators: true },
      };
      await vendorTagService.updateCustomField(vendorTagObj);
      res.data = await defaultTagService.update(obj);
    } catch (error) {
      debug(`error in updating orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
};
module.exports = defaultTagsApi;
