/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/menuItemTags');
require('express-async-errors');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const createError = require('http-errors');
const moment = require('moment');
const ModelService = require('../services/referencedModelService');
const noShowModel = require('../models/noshow');
const deliveryAgentWorkingHoursModel = require('../models/deliveryAgentsWorkingHours');
const Constant = require('../utilities/constant');

const noShowReferences = Constant.reference.noShow;
const noShowService = new ModelService(noShowModel, noShowReferences);
const agentsWorkingHoursModel = require('../models/deliveryAgentsWorkingHours');

const references = Constant.reference.agentsWorkingHour;
const agentsWorkingHoursService = new ModelService(agentsWorkingHoursModel, references);
const noShowApi = {
  saveNoShow: async (req, res, next) => {
    res.data = await noShowService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving noShow', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllNoShow: async (req, res, next) => {
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
    const totalCountRes = await noShowService.totalCount();
    const noShowRes = await noShowService.getAll(obj);
    if (noShowRes) {
      const response = { status: true, totalCount: totalCountRes, noShow: noShowRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing noShows', httpContext.get('requestId'));
      throw new Error();
    }
  },
};

module.exports = noShowApi;
