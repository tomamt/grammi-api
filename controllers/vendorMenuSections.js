/* eslint-disable no-underscore-dangle */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/VendorMenuSection');
require('express-async-errors');
const ModelService = require('../services/referencedModelService');
const vendorMenuSectionsModel = require('../models/vendorMenuSections');
const Constant = require('../utilities/constant');

const references = Constant.reference.vendorMenuSection;
const vendorMenuSectionsService = new ModelService(vendorMenuSectionsModel, references);
const vendorMenuSectionsApi = {
  saveVendorMenuSection: async (req, res, next) => {
    res.data = await vendorMenuSectionsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving vendor menu section', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorMenuSection: async (req, res, next) => {
    const Id = req.params.vendorMenuSectionId;
    const vendorMenuSectionsRes = await vendorMenuSectionsService.getById(Id);
    if (vendorMenuSectionsRes) {
      const response = { status: true, vendorMenuSection: vendorMenuSectionsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular vendor menu section', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllVendorMenuSection: async (req, res, next) => {
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
    const totalCountRes = await vendorMenuSectionsService.totalCount();
    const vendorMenuSectionsRes = await vendorMenuSectionsService.getAll(obj);
    if (vendorMenuSectionsRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        vendorMenuSection: vendorMenuSectionsRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error while listing all vendor menu section', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateVendorMenuSection: async (req, res, next) => {
    const obj = {
      Id: req.params.vendorMenuSectionId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await vendorMenuSectionsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating vendor menu section', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialVendorMenuSection: async (req, res, next) => {
    const obj1 = {
      query: {
        'menuItems.menuItemId': req.body.menuItems[0].menuItemId,
      },
    };
    const getMenuSectionByItem = await vendorMenuSectionsService.getByCustomField(obj1);
    // console.log(getMenuSectionByItem);
    if (getMenuSectionByItem.length === 0) {
      const obj = {
        Id: req.params.vendorMenuSectionId,
        data: req.body.menuItems,
        options: { runValidators: true },
      };
      res.data = await vendorMenuSectionsService.updateMenuItemsWithOutReplace(obj);
      if (res.data) {
        next();
      } else {
        debug('Error while updating partial vendor menu section', httpContext.get('requestId'));
        throw new Error();
      }
    } else {
      const ids = getMenuSectionByItem.map((id) => id._id);
      if (ids.toString().indexOf(req.params.vendorMenuSectionId) === -1) {
        debug('Get Menu Section By Menu Item', getMenuSectionByItem[0]._id);

        const obj = {
          Id: req.params.vendorMenuSectionId,
          data: req.body.menuItems,
          options: { runValidators: true },
        };
        res.data = await vendorMenuSectionsService.updateMenuItemsWithOutReplace(obj);
        if (res.data) {
          next();
        } else {
          debug('Error while updating partial vendor menu section', httpContext.get('requestId'));
          throw new Error();
        }
      } else {
        res.data = { nModified: -1, message: 'Menu Section Already Exists' };
        next();
      // throw new Error();
      }
    }
  },
  deleteMenuVendorMenuSection: async (req, res, next) => {
    const obj = { Id: req.params.vendorMenuSectionId, data: req.body.menuItems };
    res.data = await vendorMenuSectionsService.deleteMenuItemsWithOutReplace(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting menu vendor menu section', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteVendorMenuSection: async (req, res, next) => {
    const Id = req.params.vendorMenuSectionId;
    res.data = await vendorMenuSectionsService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting vendor menu section', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllVendorMenuSectionByVendor: async (req, res, next) => {
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
    const totalCountRes = await vendorMenuSectionsService.totalCount(obj);
    const vendorMenuSectionsRes = await vendorMenuSectionsService.getAll(obj);
    if (vendorMenuSectionsRes) {
      const response = {
        status: true,
        totalCount: totalCountRes,
        vendorMenuSection: vendorMenuSectionsRes,
      };
      res.data = response;
      next();
    } else {
      debug('Error while listing vendor menu section based on vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorMenuDetails: async (req, res, next) => {
    if (req.params.sortValue === undefined || req.params.sortColumn === undefined) {
      req.params.sortValue = 'asc';
      req.params.sortColumn = '_id';
    }
    if (req.params.pageSize === undefined || req.params.pageNo === undefined) {
      req.params.pageSize = 10;
      req.params.pageNo = 1;
    }

    const obj = {

      query: { 'menuItems.menuItemId': req.params.menuId },
    };
    res.data = await vendorMenuSectionsService.getAll(obj);
    if (res.data) {
      // eslint-disable-next-line no-underscore-dangle
      res.data = res.data.map((data) => ({ name: data.name, _id: data._id }));
      next();
    } else {
      debug('Error while listing vendor menu details', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = vendorMenuSectionsApi;
