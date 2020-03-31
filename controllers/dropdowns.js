const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/Dropdowns');
require('express-async-errors');
const ModelService = require('../services/modelService');
const dropdownsModel = require('../models/dropdowns');

const dropDownService = new ModelService(dropdownsModel);
const DropdownsApi = {
  saveDropdown: async (req, res, next) => {
    res.data = await dropDownService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error occured while adding Issue reason in dropdown', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDropdown: async (req, res, next) => {
    const Id = req.params.dropdownId;
    const dropdownsRes = await dropDownService.getById(Id);
    if (dropdownsRes) {
      const response = { status: true, dropdowns: dropdownsRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching particular dropdown data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllDropdown: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '1';
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
    const totalCountRes = await dropDownService.totalCount(obj);
    const dropdownsRes = await dropDownService.getAll(obj);
    if (dropdownsRes) {
      const response = { status: true, totalCount: totalCountRes, dropdowns: dropdownsRes };
      res.data = response;
      next();
    } else {
      debug('Error occured while fetching all dropdown data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateDropdown: async (req, res, next) => {
    const obj = { Id: req.params.dropdownId, data: req.body, options: { runValidators: true } };
    res.data = await dropDownService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating dropdown data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialDropdown: async (req, res, next) => {
    const obj = { Id: req.params.dropdownId, data: req.body, options: { runValidators: true } };
    res.data = await dropDownService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error occured while updating partial dropdown data', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteDropdown: async (req, res, next) => {
    const Id = req.params.dropdownId;
    res.data = await dropDownService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error occured while deleting dropdown data', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = DropdownsApi;
