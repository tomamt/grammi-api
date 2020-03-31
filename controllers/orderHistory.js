/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/orderHistory');
const ModelService = require('../services/modelService');
const orderHistoryModel = require('../models/orderHistory');

const orderHistoryService = new ModelService(orderHistoryModel);
const OrderHistoryApi = {
  saveOrderItem: async (req, res, next) => {
    try {
      res.data = await orderHistoryService.save(req.body);
    } catch (error) {
      debug(`error in save orderHistory ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getOrderItem: async (req, res, next) => {
    try {
      res.data = await orderHistoryService.getById(req.params.orderHistoryId);
    } catch (error) {
      debug(`error in getting orderHistory ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updateOrderItem: async (req, res, next) => {
    try {
      const obj = {
        Id: req.params.orderHistoryId,
        data: req.body,
        options: { runValidators: true },
      };
      res.data = await orderHistoryService.update(obj);
    } catch (error) {
      debug(`error in updating orderHistory ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updatePartialOrderItem: async (req, res, next) => {
    try {
      const obj = {
        Id: req.params.orderHistoryId,
        data: req.body,
        options: { runValidators: true },
      };
      res.data = await orderHistoryService.update(obj);
    } catch (error) {
      debug(`error in updating orderHistory ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  deleteOrderItem: async (req, res, next) => {
    try {
      res.data = await orderHistoryService.deleteRemove(req.params.orderHistoryId);
    } catch (error) {
      debug(`error in deleteting orderHistory ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getAllOrderItem: async (req, res, next) => {
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
      const totalCountRes = await orderHistoryService.totalCount();
      const orderItemRes = await orderHistoryService.getAll(obj);
      if (orderItemRes) {
        const response = { status: true, totalCount: totalCountRes, orderHistory: orderItemRes };
        res.data = response;
      }
    } catch (error) {
      debug(`error in listing orderHistory ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  orderHistoryUpdate: async (oldData, newData, action) => {
    let key;
    let oldValue;
    let newValue;
    if (action === 'status-change') {
      key = 'status';
      oldValue = oldData.status;
      newValue = newData.status;
    } else if (action === 'reassign') {
      key = 'assignee';
      oldValue = oldData.assignee;
      newValue = newData.assignee;
    }
    const history = {
      // eslint-disable-next-line no-underscore-dangle
      orderId: oldData._id,
      action,
      key,
      oldValue,
      newValue,
      modifiedBy: newData.reporter,
    };
    if (newData.recipientId) {
      history.recipientId = newData.recipientId;
    }
    const historyRes = await orderHistoryService.save(history);
  },
};
module.exports = OrderHistoryApi;
