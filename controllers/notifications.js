const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/notifications');
require('express-async-errors');
const ModelService = require('../services/modelService');
const notificationsModel = require('../models/notifications');

const notificationsService = new ModelService(notificationsModel);
const NotificationsApi = {
  saveNotification: async (req, res, next) => {
    res.data = await notificationsService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving notifications', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getNotification: async (req, res, next) => {
    const notificationsRes = await notificationsService.getById(req.params.notificationsId);
    if (notificationsRes) {
      const response = { status: true, notifications: notificationsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular notifications', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateNotification: async (req, res, next) => {
    const obj = {
      Id: req.params.notificationsId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await notificationsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating notifications', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialNotification: async (req, res, next) => {
    const obj = {
      Id: req.params.notificationsId,
      data: req.body,
      options: { runValidators: true },
    };
    res.data = await notificationsService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating partial notifications', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteNotification: async (req, res, next) => {
    res.data = await notificationsService.deleteRemove(req.params.notificationsId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting notifications', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllNotification: async (req, res, next) => {
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
    const totalCountRes = await notificationsService.totalCount();
    const notificationsRes = await notificationsService.getAll(obj);
    if (notificationsRes) {
      const response = { status: true, totalCount: totalCountRes, notifications: notificationsRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all notifications', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = NotificationsApi;
