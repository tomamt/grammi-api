const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/menuItemTags');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const Constant = require('../utilities/constant');
const menuItemTagsModel = require('../models/menuItemTags');

const references = Constant.reference.menuItem;
const menuItemTagsService = new ModelService(menuItemTagsModel, references);

const MenuItemTagsServiceApi = {
  saveMenuItemTag: async (req, res, next) => {
    res.data = await menuItemTagsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving menu item tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getMenuItemTag: async (req, res, next) => {
    const Id = req.params.menuItemTagId;
    const menuItemTagsRes = await menuItemTagsService.getById(Id);
    if (menuItemTagsRes) {
      const response = { status: true, menuItemTag: menuItemTagsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular menu item tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllMenuItemTag: async (req, res, next) => {
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
    const totalCountRes = await menuItemTagsService.totalCount();
    const menuItemTagsRes = await menuItemTagsService.getAll(obj);
    if (menuItemTagsRes) {
      const response = { status: true, totalCount: totalCountRes, menuItemTags: menuItemTagsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all menu item tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateMenuItemTag: async (req, res, next) => {
    const obj = { Id: req.params.menuItemTagId, data: req.body, options: { runValidators: true } };
    res.data = await menuItemTagsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating menu item tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialMenuItemTag: async (req, res, next) => {
    const obj = { Id: req.params.menuItemTagId, data: req.body, options: { runValidators: true } };
    res.data = await menuItemTagsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial menu item tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteMenuItemTag: async (req, res, next) => {
    const Id = req.params.menuItemTagId;
    res.data = await menuItemTagsService.deleteRemove(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting menu item tags', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = MenuItemTagsServiceApi;
