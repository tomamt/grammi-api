/**
 * Created by dibeesh on 29/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/transactions');
const ModelService = require('../services/referencedModelService');
const transactionsModel = require('../models/transactions');
const Constant = require('../utilities/constant');

const references = Constant.reference.transaction;
const transactionsService = new ModelService(transactionsModel, references);
const transactionsApi = {
  saveTransaction: async (req, res, next) => {
    res.data = await transactionsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving transaction data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getTransaction: async (req, res, next) => {
    const transactionRes = await transactionsService.getById(req.params.transactionId);
    if (transactionRes) {
      const response = { status: true, transactions: transactionRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular transaction data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateTransaction: async (req, res, next) => {
    const obj = { Id: req.params.transactionId, data: req.body, options: { runValidators: true } };
    res.data = await transactionsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating transaction data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialTransaction: async (req, res, next) => {
    const obj = { Id: req.params.transactionId, data: req.body, options: { runValidators: true } };
    res.data = await transactionsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial transaction data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteTransaction: async (req, res, next) => {
    res.data = await transactionsService.deleteRemove(req.params.transactionId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting transaction data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllTransaction: async (req, res, next) => {
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
    const totalCountRes = await transactionsService.totalCount();
    const transactionRes = await transactionsService.getAll(obj);
    if (transactionRes) {
      const response = { status: true, totalCount: totalCountRes, transactions: transactionRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all transaction data', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = transactionsApi;
