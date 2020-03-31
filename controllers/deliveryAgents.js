/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/deliveryAgents');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const deliveryAgentsModel = require('../models/deliveryAgents');
const Constant = require('../utilities/constant');

const references = Constant.reference.deliveryAgents;
const deliveryAgentsService = new ModelService(deliveryAgentsModel, references);
const deliveryAgentsApi = {
  saveDeliveryAgent: async (req, res, next) => {
    res.data = await deliveryAgentsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while adding new delivery agent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDeliveryAgent: async (req, res, next) => {
    const isValidQuery = { query: { userId: req.params.userId } };
    const deliveryAgentsRes = await deliveryAgentsService.getByCustomField(isValidQuery);
    if (deliveryAgentsRes) {
      const response = { status: true, deliveryAgents: deliveryAgentsRes };
      res.data = response;
      next();
    } else {
      debug('Error while fetching particular delivery agent details', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDeliveryAgent: async (req, res, next) => {
    const obj = { Id: req.params.deliveryAgentId, data: req.body, options: { runValidators: true } };
    res.data = await deliveryAgentsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating data in delivery agent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDeliveryAgent: async (req, res, next) => {
    const obj = { Id: req.params.deliveryAgentId, data: req.body, options: { runValidators: true } };
    res.data = await deliveryAgentsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial data in delivery agent', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDeliveryAgent: async (req, res, next) => {
    res.data = await deliveryAgentsService.deleteRemove(req.params.deliveryAgentId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting delivery agent data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDeliveryAgent: async (req, res, next) => {
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
    const totalCountRes = await deliveryAgentsService.totalCount(obj);
    const deliveryAgentsRes = await deliveryAgentsService.getAll(obj);
    if (deliveryAgentsRes) {
      const response = { status: true, totalCount: totalCountRes, deliveryAgents: deliveryAgentsRes };
      res.data = response;
      next();
    } else {
      debug('Error while fetching all delivery agent data', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = deliveryAgentsApi;
