const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/venues');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const venuesModel = require('../models/venues');
const Constant = require('../utilities/constant');

const references = Constant.reference.venue;
const venuesService = new ModelService(venuesModel, references);
const VenuesApi = {
  saveVenue: async (req, res, next) => {
    res.data = await venuesService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving venues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVenue: async (req, res, next) => {
    const venueRes = await venuesService.getById(req.params.venueId);
    if (venueRes) {
      const response = { status: true, venues: venueRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular venue', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateVenue: async (req, res, next) => {
    const obj = { Id: req.params.venueId, data: req.body, options: { runValidators: true } };
    res.data = await venuesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating venues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialVenue: async (req, res, next) => {
    const obj = { Id: req.params.venueId, data: req.body, options: { runValidators: true } };
    res.data = await venuesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial venues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteVenue: async (req, res, next) => {
    res.data = await venuesService.deleteRemove(req.params.venueId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting venues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllVenue: async (req, res, next) => {
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
    const totalCountRes = await venuesService.totalCount();
    const venueRes = await venuesService.getAll(obj);
    if (venueRes) {
      const response = { status: true, totalCount: totalCountRes, venues: venueRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all venues', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = VenuesApi;
