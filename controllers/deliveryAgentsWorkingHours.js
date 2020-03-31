/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
/* eslint-disable no-plusplus */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/deliveryAgents');
const createError = require('http-errors');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
require('express-async-errors');
const moment = require('moment-timezone');
const utilities = require('../utilities/utilities');
const ModelService = require('../services/referencedModelService');
const userModel = require('../models/users');
const OrdersService = require('../services/orders');
const noShowModel = require('../models/noshow');
const deliveryAgentsModel = require('../models/deliveryAgents');
const ordersModel = require('../models/orders');
const Constant = require('../utilities/constant');
const agentsWorkingHoursModel = require('../models/deliveryAgentsWorkingHours');

const usersService = new ModelService(userModel);
const references = Constant.reference.agentsWorkingHour;
const ordersService = new OrdersService(ordersModel, []);
const agentsWorkingHoursService = new ModelService(agentsWorkingHoursModel, references);
const noShowReferences = Constant.reference.noShow;
const noShowService = new ModelService(noShowModel, noShowReferences);
const deliveryAgentsService = new ModelService(deliveryAgentsModel, []);
const socket = require('../controllers/socket');

const agentsWorkingHoursApi = {
  agentClockInLog: async (req, res, next) => {
    const obj = {
      query: {
        _id: req.body.userId,
        userRole: 'deliveryAgent',
      },
    };
    const daValidationCheck = await usersService.getByCustomField(obj);
    if (daValidationCheck.length !== 0) {
      req.body.clockIn = new Date();
      res.data = await agentsWorkingHoursService.save(req.body);
      if (res.data) {
        next();
      } else {
        debug('Error while delivery agent clock in', httpContext.get('requestId'));
        throw new Error();
      }
    } else {
      debug('DA not exists', httpContext.get('requestId'));
      throw new Error();
    }
  },
  agentClockOutLog: async (req, res, next) => {
    let startDate;
    let endDate;
    if (req.body.timezone) {
      endDate = moment().tz(req.body.timezone).format('YYYY-MM-DD HH:mm');
      startDate = moment().tz(req.body.timezone).subtract(12, 'hours').format('YYYY-MM-DD HH:mm');
      debug('agentClockOut log start end', startDate, endDate);
    } else {
      endDate = moment().format('YYYY-MM-DD HH:mm');
      startDate = moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm');
    }
    const objCount = {
      query: {
        assignee: utilities.CreateObjectId(req.body.userId),
        status: { $nin: ['cancelled', 'delivered'] },
        createdDate: {
          $gt: new Date(startDate),
          $lt: new Date(endDate),
        },
      },
    };
    objCount.pageSize = 10;
    objCount.pageNo = 1;
    const ordersRes = await ordersService.getOrderForDeliveryAgent(objCount);
    if (ordersRes.length === 0) {
      req.body.clockOut = new Date();
      const obj = { Id: req.params.deliveryAgentsWorkingHourId, data: req.body, options: { runValidators: true } };
      res.data = await agentsWorkingHoursService.update(obj);
      if (req.body._id) {
        const dataObj = {
          id: req.body.userId,
          status: 'forceClockOut',
        };
        await socket.forceClockOutStatus(dataObj);
      }
      const daAreaUpdate = { // Remove delivery Area relationship with Da when clockout
        query: { userId: req.body.userId },
        data: { deliveryAreaId: null },
      };
      debug('daAreaUpdate clockout', daAreaUpdate);
      deliveryAgentsService.updateCustomField(daAreaUpdate);
      if (res.data) {
        next();
      } else {
        throw new Error();
      }
    } else {
      debug('Delivery agent still has orders to complete', httpContext.get('requestId'));
      errorRes = createError(200, Constant.labelList.deliveryAgentHasOrders);
      return next(errorRes);
    }
  },

  getWorkingHoursHistoryForDA: async (req, res, next) => {
    const Id = req.params.deliveryAgentId;
    let agentWorkingRes = [];
    let startDate = '';
    let endDate = '';
    if (req.query.endDate && req.query.startDate) {
      endDate = moment(req.query.endDate).add(1, 'days');
      startDate = moment(req.query.startDate);
    } else {
      endDate = moment();
      startDate = moment().subtract(30, 'days');
    }
    const query = {
      $and: [
        {
          createdDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        }, {
          userId: ObjectId(req.params.deliveryAgentId),
        }],
    };
    let hour = 0;
    let mins = 0;
    let abc;
    agentWorkingRes = await agentsWorkingHoursService.getdeliveryAgentHoursDetails(query);
    if (agentWorkingRes) {
      for (let i = 0; i < agentWorkingRes.length; i++) {
        if (agentWorkingRes[i].clockOut != null) {
          agentWorkingRes[i].diffTime1 = moment.utc(moment(agentWorkingRes[i].clockOut, 'YYYY-MM-DD HH:mm').diff(moment(agentWorkingRes[i].clockIn, 'YYYY-MM-DD HH:mm'))).format('YYYY-MM-DD HH:mm');
          agentWorkingRes[i].diffTime = moment.utc(moment(agentWorkingRes[i].clockOut, 'YYYY-MM-DD HH:mm').diff(moment(agentWorkingRes[i].clockIn, 'YYYY-MM-DD HH:mm'))).format('HH:mm');
          diffTime = new Date(agentWorkingRes[i].diffTime1);
          mins += diffTime.getMinutes(diffTime.setMinutes(diffTime.getMinutes()));
          hour += diffTime.getHours(diffTime.setHours(diffTime.getHours()));
          if (mins > 60) {
            hour += 1;
            mins -= 60;
          }
        } else {
          agentWorkingRes[i].diffTime = '00:00';
        }
      }

      const query1 = {
        query: {
          userId: req.params.deliveryAgentId,
        },
      };
      const noshowCount = await noShowService.totalCount(query1);
      const obj = {
        agentWorkingRes,
        noShowCount: noshowCount,
        totalHours: `${hour}:${mins}`,
      };
      const response = { status: true, daWorkingHours: obj };
      res.data = response;

      next();
    } else {
      debug('Error while fetching all working hours data of delivery agent', httpContext.get('requestId'));
      throw new Error();
    }
  },
};
module.exports = agentsWorkingHoursApi;
