/**
 * Created by dibeesh on 11/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/recipients');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const recipientsModel = require('../models/recipients');
const Constant = require('../utilities/constant');

const references = Constant.reference.recipient;
const recipientsService = new ModelService(recipientsModel, references);
const recipientsApi = {
  saveRecipient: async (req, res, next) => {
    res.data = await recipientsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving Recipient', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getRecipient: async (req, res, next) => {
    const recipientRes = await recipientsService.getById(req.params.recipientId);
    if (recipientRes) {
      const response = { status: true, recipients: recipientRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular recipient', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateRecipient: async (req, res, next) => {
    const obj = { Id: req.params.recipientId, data: req.body, options: { runValidators: true } };
    res.data = await recipientsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating recipient data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialRecipient: async (req, res, next) => {
    const obj = { Id: req.params.recipientId, data: req.body, options: { runValidators: true } };
    res.data = await recipientsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial recipient data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteRecipient: async (req, res, next) => {
    res.data = await recipientsService.deleteRemove(req.params.recipientId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting recipient', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllRecipient: async (req, res, next) => {
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
    const totalCountRes = await recipientsService.totalCount(obj);
    const recipientRes = await recipientsService.getAll(obj);
    if (recipientRes) {
      const response = { status: true, totalCount: totalCountRes, recipients: recipientRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all recipients', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = recipientsApi;
