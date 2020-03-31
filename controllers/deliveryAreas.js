/**
 * Created by dibeesh on 20/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/deliveryAreas');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const Constant = require('../utilities/constant');
const deliveryAreasModel = require('../models/deliveryAreas');

const references = Constant.reference.deliveryArea;
const deliveryAreasService = new ModelService(deliveryAreasModel, references);

const DeliveryAreasApi = {
  saveDeliveryArea: async (req, res, next) => {
    res.data = await deliveryAreasService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error occured while adding delivery area', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDeliveryArea: async (req, res, next) => {
    debug('req host id in get particular delivery area', req.headers['kong-request-id']);
    const Id = req.params.deliveryAreaId;
    const deliveryAreaRes = await deliveryAreasService.getById(Id);
    if (deliveryAreaRes) {
      const response = { status: true, deliveryAreas: deliveryAreaRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching particular delivery area details', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDeliveryArea: async (req, res, next) => {
    debug('req host id in get all delivery area', req.headers['kong-request-id']);
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
    const totalCountRes = await deliveryAreasService.totalCount(obj);
    const deliveryAreaRes = await deliveryAreasService.getAll(obj);
    if (deliveryAreaRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        deliveryAreas: deliveryAreaRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching all delivery area details', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDeliveryArea: async (req, res, next) => {
    debug('req host id in Update delivery area', req.headers['kong-request-id']);
    const obj = { Id: req.params.deliveryAreaId, data: req.body, options: { runValidators: true } };
    res.data = await deliveryAreasService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating delivery area', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDeliveryArea: async (req, res, next) => {
    debug('req host id in Update Partial delivery area', req.headers['kong-request-id']);
    const obj = { Id: req.params.deliveryAreaId, data: req.body, options: { runValidators: true } };
    res.data = await deliveryAreasService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating partial delivery area data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDeliveryArea: async (req, res, next) => {
    const Id = req.params.deliveryAreaId;
    res.data = await deliveryAreasService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error occured while deleting delivery area', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = DeliveryAreasApi;
