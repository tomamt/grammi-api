/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/issues');
const moment = require('moment');
require('express-async-errors');
const createError = require('http-errors');
const Constant = require('../utilities/constant');
const ReferenceModelService = require('../services/referencedModelService');
const ModelService = require('../services/orders');
const ModelDropDownService = require('../services/modelService');
const IssuesReferenceModelService = require('../services/issues');
const history = require('../controllers/orderHistory');

const orderReferences = Constant.reference.order;

const issuesModel = require('../models/issues');
const ordersModel = require('../models/orders');
const mediasModel = require('../models/medias');
const userModel = require('../models/users');
const dropdownModel = require('../models/dropdowns');
const dropdownsModel = require('../models/dropdowns');

const dropDownService = new ModelDropDownService(dropdownsModel);
const issuesService = new IssuesReferenceModelService(issuesModel, orderReferences);
const orderService = new ModelService(ordersModel, orderReferences);
const mediasService = new ReferenceModelService(mediasModel, []);
const usersService = new ReferenceModelService(userModel, []);
const dropdownService = new ReferenceModelService(dropdownModel, []);

const IssuesApi = {
  saveIssues: async (req, res, next) => {
    const { type } = req.body;
    const validationRes = await IssuesApi.issueTypeValidations(type, req.body);
    if ((req.body.orderId || req.params.orderId) && (req.body.type === 'crew-issue' || req.body.type === 'da-issue' || req.body.type === 'consumer-issue')) {
      const obj = { query: { orderId: req.body.orderId, reporter: req.body.reporter } };
      const validationCheck = await issuesService.getByCustomField(obj);
      if (validationCheck.length !== 0) {
        debug('Issue already reported by same delivery agent', httpContext.get('requestId'));
        errorRes = createError(500, Constant.labelList.maxLimitofIssue);
        throw new Error(errorRes);
      } else {
        res.data = await issuesService.save(req.body);
        req.body.status = req.body.type;
        history.orderHistoryUpdate(validationRes.oldOrderData, req.body, 'status-change');
      }
    } else if (req.body.type === 'da-break') {
      const obj = { query: { reporter: req.body.reporter } };
      const breakApplied = await issuesModel.findOne(obj.query).sort({ _id: -1 });
      if (breakApplied.length !== 0) {
        const displayDetails = await dropDownService.getById(breakApplied.orderProblemId);
        if (req.body.displayMsgForward === 'I NEED A 30 MINUTE BREAK' || req.body.displayMsgForward === 'I NEED A 15 MINUTE BREAK') {
          if (displayDetails.displayName === 'I NEED A 30 MINUTE BREAK') {
            const futureTime = new Date(moment(breakApplied.modifedDate).add(30, 'minutes'));
            if (futureTime < new Date()) {
              res.data = await issuesService.save(req.body);
            } else {
              debug('DA already applied for the break', httpContext.get('requestId'));
              errorRes = createError(404, Constant.labelList.daAppliedBreak);
              throw new Error(errorRes);
            }
          } else if (displayDetails.displayName === 'I NEED A 15 MINUTE BREAK') {
            const futureTime = new Date(moment(breakApplied.modifedDate).add(15, 'minutes'));
            if (futureTime < new Date()) {
              res.data = await issuesService.save(req.body);
            } else {
              debug('DA already applied for the break', httpContext.get('requestId'));
              errorRes = createError(404, Constant.labelList.daAppliedBreak);
              throw new Error(errorRes);
            }
          } else {
            res.data = await issuesService.save(req.body);
          }
        } else {
          res.data = await issuesService.save(req.body);
        }
      } else {
        res.data = await issuesService.save(req.body);
      }
    }
    next();
  },
  getIssues: async (req, res, next) => {
    const issuesRes = await issuesService.getById(req.params.issueId);
    if (issuesRes) {
      const response = { status: true, issues: issuesRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular issues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateIssues: async (req, res, next) => {
    const obj = { Id: req.params.issueId, data: req.body, options: { runValidators: true } };
    res.data = await issuesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating issues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialIssues: async (req, res, next) => {
    const validationCheck = await issuesService.getById(req.params.issueId);
    const obj1 = {
      query: {
        _id: validationCheck.orderId,
        status: { $nin: ['delivered', 'cancelled'] },
      },
    };
    const orderIdValidation = await orderService.getByCustomField(obj1);
    if (orderIdValidation.length !== 0) {
      const obj = { Id: req.params.issueId, data: req.body, options: { runValidators: true } };
      res.data = await issuesService.update(obj);
      if (res.data) {
        next();
      } else {
        debug('Error while updating partial issues', httpContext.get('requestId'));
        throw new Error();
      }
    } else {
      res.data = { nModified: -1, message: 'Order has been already delivered' };
      next();
    }
  },
  deleteIssues: async (req, res, next) => {
    res.data = await issuesService.deleteRemove(req.params.issueId);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting issues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllIssues: async (req, res, next) => {
    let totalCountRes;
    let issuesRes;
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
    if (req.query.search) {
      const orderIdList = [];
      search = new RegExp(`.*${req.query.search}.*`, 'i');
      query = { orderId: { $regex: search } };
      const orders = await orderService.getByCustomField({ query });
      await orders.forEach((element) => {
        // eslint-disable-next-line no-underscore-dangle
        orderIdList.push(element._id);
      });
      obj.query.$and = [{ orderId: { $in: orderIdList } }];
      totalCountRes = await issuesService.totalCount(obj);
      issuesRes = await issuesService.getAllIssues(obj);
    } else {
      totalCountRes = await issuesService.totalCount(obj);
      issuesRes = await issuesService.getAllIssues(obj);
    }
    if (issuesRes) {
      const response = { status: true, totalCount: totalCountRes, issues: issuesRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all issues', httpContext.get('requestId'));
      throw new Error();
    }
  },
  issueTypeValidations: async (type, data) => {
    let errorRes;
    const {
      orderId, voiceRecordingId, reporter, orderProblemId,
    } = data;
    const validationRes = {};
    if (type === 'crew-issue') {
      const order = {
        query: { _id: orderId, status: { $nin: ['cancelled', 'delivered'] } },
      };
      const orderRes = await orderService.getByCustomField(order);
      if (orderRes.length === 0) {
        debug('Invalid order in issues', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidOrder);
        throw new Error(errorRes);
      }
      if (voiceRecordingId) {
        const media = {
          query: { _id: voiceRecordingId },
        };
        const mediaRes = await mediasService.getByCustomField(media);
        if (mediaRes.length === 0) {
          debug('Invalid media in issues', httpContext.get('requestId'));
          errorRes = createError(404, Constant.labelList.invalidMedia);
          throw new Error(errorRes);
        }
      }
      const user = {
        query: { _id: reporter, userRole: 'crew' },
      };
      const userRes = await usersService.getByCustomField(user);
      if (userRes.length === 0) {
        debug('Invalid crew member issues', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidCrew);
        throw new Error(errorRes);
      }
      validationRes.oldOrderData = orderRes[0];
    } else if (type === 'da-issue') {
      const order = {
        query: { _id: orderId },
      };
      const orderRes = await orderService.getByCustomField(order);
      if (orderRes.length === 0) {
        debug('Invalid order in issues', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidOrder);
        throw new Error(errorRes);
      }
      const user = {
        query: { _id: reporter, userRole: 'deliveryAgent' },
      };
      const userRes = await usersService.getByCustomField(user);
      if (userRes.length === 0) {
        debug('Invalid DA in issues', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidDa);
        throw new Error(errorRes);
      }
      const reason = {
        query: { _id: orderProblemId, type: 'daCancellationReason' },
      };
      const dropdownRes = await dropdownService.getByCustomField(reason);
      if (dropdownRes.length === 0) {
        debug('Invalid DA cancellation reason in issues', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidProblem);
        throw new Error(errorRes);
      }
      validationRes.oldOrderData = orderRes[0];
    } else if (type === 'da-break') {
      const user = {
        query: { _id: reporter, userRole: 'deliveryAgent' },
      };
      const userRes = await usersService.getByCustomField(user);
      if (userRes.length === 0) {
        debug('Invalid DA in issues', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidDa);
        throw new Error(errorRes);
      }
      const reason = {
        query: { _id: orderProblemId, type: 'daBreak' },
      };
      const dropdownRes = await dropdownService.getByCustomField(reason);
      if (dropdownRes.length === 0) {
        debug('error when DA applied for a break', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidProblem);
        throw new Error(errorRes);
      }
    } else {
      debug('valdation failed in issues', httpContext.get('requestId'));
      errorRes = createError(422, 'Validation Failed');
      throw new Error(errorRes);
    }
    return validationRes;
  },
};
module.exports = IssuesApi;
