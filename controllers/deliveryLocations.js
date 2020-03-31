const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/deliveryLocations');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const Constant = require('../utilities/constant');
const deliveryLocationsModel = require('../models/deliveryLocations');

const references = Constant.reference.deliveryLocation;
const deliveryLocationsService = new ModelService(deliveryLocationsModel, references);

const DeliveryLocationsApi = {
  saveDeliveryLocation: async (req, res, next) => {
    res.data = await deliveryLocationsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error occured while adding delivery location', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDeliveryLocation: async (req, res, next) => {
    const Id = req.params.deliveryLocationId;
    const deliveryLocationRes = await deliveryLocationsService.getById(Id);
    if (deliveryLocationRes) {
      const response = { status: true, deliveryLocations: deliveryLocationRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching particular delivery location details', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDeliveryLocation: async (req, res, next) => {
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
    const totalCountRes = await deliveryLocationsService.totalCount(obj);
    const deliveryLocationRes = await deliveryLocationsService.getAll(obj);
    if (deliveryLocationRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        deliveryLocations: deliveryLocationRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching all delivery location details', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDeliveryLocation: async (req, res, next) => {
    const obj = {
      Id: req.params.deliveryLocationId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await deliveryLocationsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating delivery location data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDeliveryLocation: async (req, res, next) => {
    const obj = {
      Id: req.params.deliveryLocationId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await deliveryLocationsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating partial delivery location data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDeliveryLocation: async (req, res, next) => {
    const Id = req.params.deliveryLocationId;
    res.data = await deliveryLocationsService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error occured while deleting delivery location', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = DeliveryLocationsApi;
