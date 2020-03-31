const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/orderDeliveryAgentDetails');
require('express-async-errors');
const ModelService = require('../services/modelService');
const orderDeliveryAgentDetailsModel = require('../models/orderDeliveryAgentDetails');

const orderDeliveryAgentDetailsService = new ModelService(orderDeliveryAgentDetailsModel);
const OrderDeliveryAgentDetailsApi = {
  saveDeliveryAgent: async (req, res, next) => {
    res.data = await orderDeliveryAgentDetailsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving order deliveryagent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDeliveryAgentDetail: async (req, res, next) => {
    const orderDeliveryAgentDetailsRes = await orderDeliveryAgentDetailsService
      .getById(req.params.orderDeliveryAgentDetailId);

    if (orderDeliveryAgentDetailsRes) {
      const response = { status: true, orderDeliveryAgentDetails: orderDeliveryAgentDetailsRes };
      res.data = response;
      next();
    } else {
      debug('Error while fetching particular order deliveryagent data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDeliveryAgentDetails: async (req, res, next) => {
    const obj = {
      Id: req.params.orderDeliveryAgentDetailId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await orderDeliveryAgentDetailsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating order deliveryagent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDeliveryAgentDetails: async (req, res, next) => {
    const obj = {
      Id: req.params.orderDeliveryAgentDetailId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await orderDeliveryAgentDetailsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial order deliveryagent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDeliveryAgentDetails: async (req, res, next) => {
    res.data = await orderDeliveryAgentDetailsService
      .deleteRemove(req.params.orderDeliveryAgentDetailId);

    if (res.data) {
      next();
    } else {
      debug('Error while deleting order deliveryagent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDeliveryAgentDetail: async (req, res, next) => {
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
    const totalCountRes = await orderDeliveryAgentDetailsService.totalCount();
    const orderDeliveryAgentDetailsRes = await orderDeliveryAgentDetailsService.getAll(obj);
    if (orderDeliveryAgentDetailsRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        orderDeliveryAgentDetails: orderDeliveryAgentDetailsRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error while listing all order deliveryagent data', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = OrderDeliveryAgentDetailsApi;
