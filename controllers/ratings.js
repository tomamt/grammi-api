/**
 * Created by dibeesh on 18/11/19.
 */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/ratings');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const ratingsModel = require('../models/ratings');
const Constant = require('../utilities/constant');

const references = Constant.reference.rating;
const ratingsService = new ModelService(ratingsModel, references);
const RatingsApi = {
  saveRating: async (req, res, next) => {
    res.data = await ratingsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving rating', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getRating: async (req, res, next) => {
    const ratingRes = await ratingsService.getById(req.params.ratingId);
    if (ratingRes) {
      const response = { status: true, ratings: ratingRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular rating', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateRating: async (req, res, next) => {
    const obj = { Id: req.params.ratingId, data: req.body, options: { runValidators: true } };
    res.data = await ratingsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating rating', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialRating: async (req, res, next) => {
    const obj = { Id: req.params.ratingId, data: req.body, options: { runValidators: true } };
    res.data = await ratingsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial rating', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteRating: async (req, res, next) => {
    res.data = await ratingsService.deleteRemove(req.params.ratingId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting rating', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllRating: async (req, res, next) => {
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
    const totalCountRes = await ratingsService.totalCount();
    const ratingRes = await ratingsService.getAll(obj);
    if (ratingRes) {
      const response = { status: true, totalCount: totalCountRes, ratings: ratingRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all rating', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = RatingsApi;
