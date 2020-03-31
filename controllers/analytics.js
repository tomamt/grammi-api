/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-empty */
/* eslint-disable no-plusplus */
/* eslint-disable radix */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/analytics');
require('express-async-errors');
// eslint-disable-next-line no-unused-vars
const uuidv4 = require('uuid/v4');
const moment = require('moment');
const ordersModel = require('../models/orders');
const ordersItemsModel = require('../models/orderItems');
const ratingsModel = require('../models/ratings');
const ModelService = require('../services/analyticsService');
const DeliveryService = require('../services/modelService');
const Constant = require('../utilities/constant');
const deliveryAreasModel = require('../models/deliveryAreas');
const AvgTimeBetweenDeliveriesModel = require('../models/analyticsTimeBetweenDeliveries');

const deliveryAreasService = new DeliveryService(deliveryAreasModel);
const AvgTimeBetweenDeliveriesService = new ModelService(AvgTimeBetweenDeliveriesModel);
const ordersService = new ModelService(ordersModel);
const ordersItemsService = new ModelService(ordersItemsModel);
const ratingService = new ModelService(ratingsModel);

const AnalyticsApi = {
  getTerminalAnalytics: async (req, res, next) => {
    const obj = {
      id: req.params.terminalId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const gateRes = await ordersService.getTerminalGateAnalytics(obj);
    if (gateRes) {
      const response = { status: true, gate: gateRes };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Terminal Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getOrdersEfficiencyAnalytics: async (req, res, next) => {
    const obj = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      timeZone: req.query.timezone,
    };

    const ordersChartRes = await ordersService.getOrdersEfficiencyAnalytics(obj);
    const orderList = [];

    const groupedObj = {};
    for (const { _id: { hour, interval }, count } of ordersChartRes) {
      if (!groupedObj[hour]) {
        groupedObj[hour] = { time: hour };
      }
      groupedObj[hour][interval] = count;
    }
    const output = Object.values(groupedObj);
    if (ordersChartRes) {
      const response = { status: true, chartData: output };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Order Efficiency Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getCancellationEfficiencyAnalytics: async (req, res, next) => {
    const obj = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      timeZone: req.query.timezone,
    };
    const cancellationChartRes = await ordersService.getCancellationEfficiencyAnalytics(obj);
    const groupedObj = {};
    for (const { _id: { hour, interval }, count } of cancellationChartRes) {
      if (!groupedObj[hour]) {
        groupedObj[hour] = { time: hour };
      }
      groupedObj[hour][interval] = count;
    }
    const output = Object.values(groupedObj);
    if (cancellationChartRes) {
      const response = { status: true, chartData: output };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Cancellation Efficiency Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getRatingEfficiencyAnalytics: async (req, res, next) => {
    const obj = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      timeZone: req.query.timezone,
    };

    const ratingChartRes = await ratingService.getRatingEfficiencyAnalytics(obj);
    const groupedObj = {};
    for (const { _id: { hour, interval }, count } of ratingChartRes) {
      if (!groupedObj[hour]) {
        groupedObj[hour] = { time: hour };
      }
      groupedObj[hour][interval] = count;
    }
    const output = Object.values(groupedObj);
    if (ratingChartRes) {
      const response = { status: true, chartData: output };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Rating Efficiency Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getDeliveriesEfficiencyAnalytics: async (req, res, next) => {
    const obj = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const chartRes = await ordersService.getDeliveriesEfficiencyAnalytics(obj);
    const output = chartRes.reduce((acc, result) => acc + result.count, 0);
    chartRes.percent = chartRes.map((res1) => (res1.count / output) * 100);
    for (let i = 0; i < chartRes.length; i++) {
      chartRes[i].percent = (chartRes[i].count / output) * 100;
    }

    if (chartRes) {
      const response = { status: true, chartData: chartRes };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Deliverires Efficiency Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorOrdersAnalytics: async (req, res, next) => {
    const obj = {
      vendorId: req.params.vendorId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const query = { $sum: 1 };
    const orders = [];
    const ordersChartRes = await ordersService.getVendorAnalytics(obj, query);
    if (ordersChartRes) {
      const newarray = ordersChartRes.map((v) => ({ ...v, monthName: moment(v._id, 'MM').format('MMM') }));
      const response = { status: true, chartData: newarray };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Vendors Orders Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorSalesAnalytics: async (req, res, next) => {
    const obj = {
      vendorId: req.params.vendorId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const query = { $sum: '$totalAmount' };
    const orders = [];
    const ordersChartRes = await ordersService.getVendorAnalytics(obj, query);
    if (ordersChartRes) {
      const newarray = ordersChartRes.map((v) => ({ ...v, count: parseInt(v.count), monthName: moment(v._id, 'MM').format('MMM') }));
      const response = { status: true, chartData: newarray };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Vendors Sales Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorLocationAnalytics: async (req, res, next) => {
    const obj = {
      vendorId: req.params.vendorId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const ordersChartRes = await ordersService.getVendorLocationAnalytics(obj);
    if (ordersChartRes) {
      const response = { status: true, chartData: ordersChartRes };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Vendors Location Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorCategoryAnalytics: async (req, res, next) => {
    const obj = {
      vendorId: req.params.vendorId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const ordersChartRes = await ordersItemsService.getVendorCategoryAnalytics(obj);
    const output = [];
    if (ordersChartRes) {
      for (let i = 0; i < ordersChartRes.length; i++) {
        for (let j = 0; j < ordersChartRes[i].categoryId.length; j++) {
          const abc = output.map((e) => e.categoryId).indexOf(ordersChartRes[i].categoryId[j].toString());
          if (output.map((e) => e.categoryId).indexOf(ordersChartRes[i].categoryId[j].toString()) === -1) {
            output.push({ categoryId: ordersChartRes[i].categoryId[j].toString(), name: ordersChartRes[i].name[j], count: ordersChartRes[i].count });
          } else {
            const count = ordersChartRes[i].count + output[abc].count;
            output[abc].count = count;
          }
        }
      }
      const response = { status: true, chartData: output };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Vendors Category Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorAvgCookingTimeAnalytics: async (req, res, next) => {
    const newArray = [];
    const obj = {
      vendorId: req.params.vendorId,
      field: 'vendorId',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      fieldname: 'cookingTime',
    };
    const query = { $avg: { $toInt: '$cookingTime' } };
    const ordersChartRes = await ordersService.getVendorAvgAnalytics(obj, query);

    if (ordersChartRes) {
      const newList = ordersChartRes.map((v) => ({ ...v, monthName: moment(v._id, 'MM').format('MMM') }));
      const output = ordersChartRes.reduce((acc, result) => acc + result.avgTime, 0);
      const avgTime = output / ordersChartRes.length;
      newArray.push({ avgTime: avgTime.toFixed(2), data: newList });
      const response = { status: true, chartData: newArray };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Vendor Avg Cooking Time Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getTerminalAvgDeliveryTimeAnalytics: async (req, res, next) => {
    const newArray = [];
    const obj = {
      vendorId: req.params.terminalId,
      field: 'deliveryAreaId',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      fieldname: 'deliveryTime',
    };
    const query = { $avg: { $toInt: '$deliveryTime' } };
    const ordersChartRes = await ordersService.getVendorAvgAnalytics(obj, query);
    if (ordersChartRes) {
      const newList = ordersChartRes.map((v) => ({ ...v, monthName: moment(v._id, 'MM').format('MMM') }));
      const output = ordersChartRes.reduce((acc, result) => acc + result.avgTime, 0);
      const avgTime = output / ordersChartRes.length;
      newArray.push({ avgTime: avgTime.toFixed(2), data: newList });
      const response = { status: true, chartData: newArray };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Terminal Efficiency Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getVendorAvgOrderTimeAnalytics: async (req, res, next) => {
    const newArray = [];
    const obj = {
      vendorId: req.params.vendorId,
      field: 'vendorId',
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      fieldname: 'orderCompletionTime',
    };
    const query = { $avg: { $toInt: '$orderCompletionTime' } };
    const ordersChartRes = await ordersService.getVendorAvgAnalytics(obj, query);
    if (ordersChartRes) {
      const newList = ordersChartRes.map((v) => ({ ...v, monthName: moment(v._id, 'MM').format('MMM') }));
      const output = ordersChartRes.reduce((acc, result) => acc + result.avgTime, 0);
      const avgTime = output / ordersChartRes.length;
      newArray.push({ avgTime: avgTime.toFixed(2), data: newList });
      const response = { status: true, chartData: newArray };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Vendor Avg Order Time Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAvgOrderTimeEfficiencyAnalytics: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    const obj1 = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
    };
    const obj = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      fieldname: 'orderCompletionTime',
      timeZone: req.query.timezone,
    };
    const query = { $avg: { $toInt: '$deliveryTime' } };
    async function getFunc() {
      const result = await ordersService.getAvgOrderTimeEfficiencyAnalytics(obj, query);
      return result;
    }
    const orderRes = [];
    const deliveryAreaList = await deliveryAreasService.getAll(obj1);
    for (let i = 0; i < deliveryAreaList.length; i++) {
      const output = [];
      obj.deliveryAreaId = deliveryAreaList[i]._id.toString();
      const objDetails = await getFunc();
      if (objDetails.length !== 0) {
        objDetails.map((result) => output.push({ minutes: result.time, time: result.time, avgTime: result.avgTime }));
      } else {
        const quarterHours = ['0', '15', '30', '45'];
        for (let z = 0; z < 24; z++) {
          for (let j = 0; j < 4; j++) {
            output.push({ minutes: `${z}:${quarterHours[j]}`, time: `${z}:${quarterHours[j]}`, avgTime: 0 });
          }
        }
      }
      orderRes.push({ name: deliveryAreaList[i].name, chartData: output });
    }
    if (orderRes) {
      const response = { status: true, chartData: orderRes };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Avg Order Time Efficiency Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getTerminalAvgBetweenDeliveriesTimeAnalytics: async (req, res, next) => {
    const newArray = [];
    const obj = {
      deliveryAreaId: req.params.terminalId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      fieldname: 'deliveryTime',
    };
    const query = { $avg: { $toInt: '$timeBetweenDeliveries' } };
    const ordersChartRes = await AvgTimeBetweenDeliveriesService.getTerminalAvgBetweenDeliveriesTimeAnalytics(obj, query);
    if (ordersChartRes) {
      const newList = ordersChartRes.map((v) => ({ ...v, monthName: moment(v._id, 'MM').format('MMM') }));
      const output = ordersChartRes.reduce((acc, result) => acc + result.avgTime, 0);
      const avgTime = output / ordersChartRes.length;
      newArray.push({ avgTime: avgTime.toFixed(2), data: newList });
      const response = { status: true, chartData: newArray };
      res.data = response;
      next();
    } else {
      debug('Error in listing data for Teminal Avg Time B/w Deliveries Analytics API', httpContext.get('requestId'));
      throw new Error();
    }
  },

};


module.exports = AnalyticsApi;
