const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/menuItems');
require('express-async-errors');
const ModelService = require('../services/menuItemsModelService');
const Constant = require('../utilities/constant');
const menuItemsModel = require('../models/menuItems');

const references = Constant.reference.menuItem;
const menuItemsService = new ModelService(menuItemsModel, references);

const MenuItemsApi = {
  saveMenuItem: async (req, res, next) => {
    res.data = await menuItemsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving menu item', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getMenuItem: async (req, res, next) => {
    const Id = req.params.menuItemId;
    const menuItemRes = await menuItemsService.getById(Id);
    if (menuItemRes) {
      const response = { status: true, menuItems: menuItemRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular menu item', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllMenuItem: async (req, res, next) => {
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
    const totalCountRes = await menuItemsService.totalCount();
    const menuItemRes = await menuItemsService.getAll(obj);
    if (menuItemRes) {
      const response = { status: true, totalCount: totalCountRes, menuItem: menuItemRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all menu item', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateMenuItem: async (req, res, next) => {
    const obj = { Id: req.params.menuItemId, data: req.body, options: { runValidators: true } };
    res.data = await menuItemsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating menu item', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialMenuItem: async (req, res, next) => {
    const obj = { Id: req.params.menuItemId, data: req.body, options: { runValidators: true } };
    res.data = await menuItemsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial menu item', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteMenuItem: async (req, res, next) => {
    const Id = req.params.menuItemId;
    res.data = await menuItemsService.deleteRemove(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting menu item', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorMenuItem: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
      query: { vendorId: req.params.vendorId },
    };
    const totalCountRes = await menuItemsService.totalCount(obj);
    const menuItemRes = await menuItemsService.getAll(obj);
    if (menuItemRes) {
      const response = { status: true, totalCount: totalCountRes, menuItem: menuItemRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing menu item based on vendors', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = MenuItemsApi;
