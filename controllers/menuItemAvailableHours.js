/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/menuItemAvailableHours');
require('express-async-errors');
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment');
const ModelService = require('../services/referencedModelService');
const Constant = require('../utilities/constant');
const menuItemAvailableHours = require('../models/menuItemAvailableHours');
const menuItems = require('../models/menuItems');

const references = Constant.reference.menuItemAvailableHour;
const menuItemAvailableHourService = new ModelService(menuItemAvailableHours, references);
const menuItemService = new ModelService(menuItems, []);
const MenuItemsApi = {
  saveMenuItemAvailableHour: async (req, res, next) => {
    res.data = await menuItemAvailableHourService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving Menu item available hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getMenuItemAvailableHour: async (req, res, next) => {
    const Id = req.params.menuItemAvailableHourId;
    const menuItemAvailableHourRes = await menuItemAvailableHourService.getById(Id);
    if (menuItemAvailableHourRes) {
      const response = { status: true, menuItemAvailableHour: menuItemAvailableHourRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing Menu particular available hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllMenuItemAvailableHour: async (req, res, next) => {
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
    const totalCountRes = await menuItemAvailableHourService.totalCount(obj);
    const menuItemAvailableHourRes = await menuItemAvailableHourService.getAll(obj);
    if (menuItemAvailableHourRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        menuItemAvailableHours: menuItemAvailableHourRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error while listing all Menu item available hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateMenuItemAvailableHour: async (req, res, next) => {
    const obj = {
      Id: req.params.menuItemAvailableHourId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await menuItemAvailableHourService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating Menu item available hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialMenuItemAvailableHour: async (req, res, next) => {
    const obj = {
      Id: req.params.menuItemAvailableHourId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await menuItemAvailableHourService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial Menu item available hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteMenuItemAvailableHour: async (req, res, next) => {
    const Id = req.params.menuItemAvailableHourId;
    res.data = await menuItemAvailableHourService.deleteRemove(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting Menu item available hour', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteMenuItemHours: async (req, res, next) => {
    const Id = req.params.menuItemId;
    const obj = { Id, data: { menuItemAvailableTime: [] }, options: { runValidators: true } };
    await menuItemService.update(obj);
    res.data = await menuItemAvailableHourService.deleteMenuItemHours(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting Menu item hours', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = MenuItemsApi;
