/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/carts');
require('express-async-errors');
const uuidv4 = require('uuid/v4');
const ModelService = require('../services/cartsModelService');
const cartsModel = require('../models/carts');
const venuesModel = require('../models/venues');
const Constant = require('../utilities/constant');

const cartsService = new ModelService(cartsModel);

const CartsApi = {
  saveCart: async (req, res, next) => {
    req.body.transactionIdentifier = uuidv4();
    res.data = await cartsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while adding data to Cart', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getCart: async (req, res, next) => {
    const Id = req.params.cartsId;
    const cartRes = await cartsService.getById(Id);
    if (cartRes) {
      const response = { status: true, cart: cartRes };
      res.data = response;
      next();
    } else {
      debug('Error Occured while fetching particular data from Cart', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllCart: async (req, res, next) => {
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
    const totalCountRes = await cartsService.totalCount();
    const cartRes = await cartsService.getAll(obj);
    if (cartRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        carts: cartRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error Occured while fetching all data from Cart', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateCart: async (req, res, next) => {
    const obj = { Id: req.params.cartsId, data: req.body, options: { runValidators: true } };
    res.data = await cartsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while updating data in Cart', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialCart: async (req, res, next) => {
    const obj = { Id: req.params.cartsId, data: req.body, options: { runValidators: true } };
    res.data = await cartsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while updating partial data in Cart', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteCart: async (req, res, next) => {
    const Id = req.params.cartsId;
    res.data = await cartsService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error Occured while deleting data from Cart', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = CartsApi;
