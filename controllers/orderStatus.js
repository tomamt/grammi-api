const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/orderStatus');
const ModelService = require('../services/modelService');
const orderStatusModel = require('../models/orderStatus');

const orderStatusService = new ModelService(orderStatusModel);
const OrderStatusApi = {
  saveOrderItem: async (req, res, next) => {
    try {
      res.data = await orderStatusService.save(req.body);
    } catch (error) {
      debug(`error in save orderStatus ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getOrderItem: async (req, res, next) => {
    try {
      res.data = await orderStatusService.getById(req.params.orderStatusId);
    } catch (error) {
      debug(`error in getting orderStatus ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updateOrderItem: async (req, res, next) => {
    try {
      const obj = {
        Id: req.params.orderStatusId,
        data: req.body,
        options: { runValidators: true },
      };
      res.data = await orderStatusService.update(obj);
    } catch (error) {
      debug(`error in updating orderStatus ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updatePartialOrderItem: async (req, res, next) => {
    try {
      const obj = {
        Id: req.params.orderStatusId,
        data: req.body,
        options: { runValidators: true },
      };
      res.data = await orderStatusService.update(obj);
    } catch (error) {
      debug(`error in updating orderStatus ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  deleteOrderItem: async (req, res, next) => {
    try {
      res.data = await orderStatusService.deleteRemove(req.params.orderStatusId);
    } catch (error) {
      debug(`error in deleteting orderStatus ${error}`, httpContext.get('requestId'));
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
      const totalCountRes = await orderStatusService.totalCount();
      const orderItemRes = await orderStatusService.getAll(obj);
      if (orderItemRes) {
        const response = { status: true, totalCount: totalCountRes, orderStatus: orderItemRes };
        res.data = response;
      }
    } catch (error) {
      debug(`error in listing orderStatus ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
};
module.exports = OrderStatusApi;
