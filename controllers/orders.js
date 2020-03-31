/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-plusplus */
/* eslint-disable no-const-assign */
/* eslint-disable no-restricted-globals */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/orders');
const createError = require('http-errors');
const moment = require('moment');
const config = require('../config/config');
const ModelService = require('../services/orders');
const ReferencedModelService = require('../services/referencedModelService');
const CommonModelService = require('../services/commonService');
const Constant = require('../utilities/constant');
const ordersModel = require('../models/orders');
const analyticsTimeBetweenDeliveries = require('../models/analyticsTimeBetweenDeliveries');
// const orderStatusModel = require('../models/orderStatus');
const orderHistoryModel = require('../models/orderHistory');
const userModel = require('../models/users');
const utilities = require('../utilities/utilities');
const history = require('../controllers/orderHistory');
const orderItem = require('../controllers/orderItems');
const socket = require('../controllers/socket');
const stripeService = require('../services/stripe');
// eslint-disable-next-line no-unused-vars
const ordersDeliveryAgentModel = require('../models/orderDeliveryAgentDetails');
const deliveryAreaModel = require('../models/deliveryAreas');
const issuesModel = require('../models/issues');
const ratingsModel = require('../models/ratings');
const orderItemsModel = require('../models/orderItems');

const references = Constant.reference.menuItem;
const orderReferences = Constant.reference.order;
const orderHistoryReferences = Constant.reference.history;

const ordersService = new ModelService(ordersModel, references);
const analyticsDeliveriesService = new ModelService(analyticsTimeBetweenDeliveries, []);
const orderDeliveryAgentService = new ModelService(ordersModel, references);
const orderHistoryService = new ReferencedModelService(orderHistoryModel, orderHistoryReferences);
const userService = new ReferencedModelService(userModel, []);
const deliveryAreaService = new CommonModelService(deliveryAreaModel);
const issuesService = new CommonModelService(issuesModel, []);
const ratingsService = new CommonModelService(ratingsModel, []);
const orderItemsService = new CommonModelService(orderItemsModel, []);

const GetIssueDetailWithOrder = async (orderList) => {
  const finalOrderRes = [];
  await Promise.all(orderList.map(async (element, index) => {
    const query = {
      $and: [
        // eslint-disable-next-line no-underscore-dangle
        { orderId: element._id },
        { status: 'open' },
      ],
    };
    const object = { query };
    const isuesData = await issuesService.getByCustomField(object);
    if (isuesData.length !== 0) {
      const data = Object.assign(orderList[index].toObject(), {
        issues: isuesData,
      });
      finalOrderRes.push(data);
    } else {
      finalOrderRes.push(orderList[index]);
    }
  }));
  return finalOrderRes;
};

const GetDeliveryStatusOfOrder = async (Id) => {
  const menuNotDelivered = [];
  let status = 'Delivered all item';
  const query = { orderId: Id };
  const orderItemDetails = await orderItemsService.getByCustomField({ query });
  if (orderItemDetails.length !== 0) {
    orderItemDetails.forEach((element) => {
      if (element.status === 'pending') {
        menuNotDelivered.push(element.name);
      }
    });
    if (menuNotDelivered.length !== 0) {
      status = 'Partial delivered';
    }
  }
  const deliveryStatus = { deliveryStatus: status, menuItemNotDelivered: menuNotDelivered };
  return deliveryStatus;
};

const OrdersApi = {
  saveOrder: async (req, res, next) => {
    const orderId = await OrdersApi.generateOrderId(req.body.deliveryAreaId);
    req.body.orderId = orderId;
    res.data = await ordersService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('Error while saving orders', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getOrder: async (req, res, next) => {
    const Id = req.params.orderId;
    const orderRes = await ordersService.getById(Id);
    const query = { orderId: Id };
    const object = { query };
    let finalOrderRes;
    const isuesData = await issuesService.getByCustomField(object);
    const ratingsData = await ratingsService.getByCustomField(object);
    const deliveryStatus = await GetDeliveryStatusOfOrder(Id);
    if (isuesData.length !== 0 || ratingsData.length !== 0) {
      finalOrderRes = Object.assign(orderRes.toObject(), {
        issues: isuesData,
        ratings: ratingsData[0],
        deliveryStatus,
      });
    } else {
      finalOrderRes = Object.assign(orderRes.toObject(), {
        deliveryStatus,
      });
    }
    orderRes.ratings = ratingsData;
    if (orderRes) {
      const response = { status: true, order: finalOrderRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular orders', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllOrder: async (req, res, next) => {
    let search;
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'modifedDate';
    }
    if (req.query.pageSize === undefined || req.query.pageNo === undefined) {
      req.query.pageSize = 10;
      req.query.pageNo = 1;
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
    };
    const filters = await OrdersApi.OrderFilters(req.query);
    obj.query = filters;
    if (req.query.search) {
      search = new RegExp(`.*${req.query.search}.*`, 'i');
      obj.query.$or = [{ orderId: { $regex: search } }];
    }
    const totalCountRes = await ordersService.totalCount(obj);
    const orderRes = await ordersService.getAll(obj);
    const finalOrderRes = await GetIssueDetailWithOrder(orderRes);
    if (finalOrderRes) {
      const response = { status: true, totalCount: totalCountRes, orders: finalOrderRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all orders', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateOrder: async (req, res, next) => {
    const obj = { Id: req.params.orderId, data: req.body, options: { runValidators: true } };
    res.data = await ordersService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating orders', httpContext.get('requestId'));
      throw new Error();
    }
  },
  // eslint-disable-next-line consistent-return
  updatePartialOrder: async (req, res, next) => {
    const { orderId } = req.params;
    const { assignee, status } = req.body;
    let errorRes;
    const obj1 = {
      query: {
        _id: orderId,
        status: { $nin: ['delivered', 'cancelled'] },
      },
    };
    const orderRes = await ordersService.getByCustomField(obj1);
    if (orderRes.length === 0) {
      debug('Invalid order in update partial order', httpContext.get('requestId'));
      // errorRes = createError(404, Constant.labelList.invalidOrder);
      // return next(errorRes);
      res.data = { nModified: -1, message: 'Order has been already delivered/cancelled' };
      next();
    } else {
      if (assignee) {
        const userQuery = { query: { userRole: 'deliveryAgent', _id: assignee } };
        const userRes = await userService.getByCustomField(userQuery);
        if (userRes.length === 0) {
          debug('Invalid Da in update partial orders', httpContext.get('requestId'));
          errorRes = createError(404, Constant.labelList.invalidDa);
          return next(errorRes);
        }
      }
      const obj = { Id: req.params.orderId, data: req.body, options: { runValidators: true } };
      // Update order History for status - pickedup, arrived, delivered, fired, ready
      if (req.body.status) {
        if (((req.body.status === 'fired') || (req.body.status === 'ready')) && (req.body.menuItemId !== undefined)) {
          const allowUpdation = await orderItem.updateStatusInOrderItem(req.params.orderId, req.body);
          if (allowUpdation === true) {
            history.orderHistoryUpdate(orderRes[0], req.body, 'status-change');
            OrdersApi.updateDeliveryTime(orderRes[0], req.body.status);
            res.data = await ordersService.update(obj);
          } else {
            debug('Menu Item is required in update partial orders', httpContext.get('requestId'));
            errorRes = createError(406, Constant.labelList.requiredMenuItem);
            return next(errorRes);
          }
        } else {
          res.data = await ordersService.update(obj);
          history.orderHistoryUpdate(orderRes[0], req.body, 'status-change');
          OrdersApi.updateDeliveryTime(orderRes[0], req.body.status);
          if (req.body.status === 'pickedup') { // Update Analytics table to for calculate avg time bn deliveries
            OrdersApi.addAverageTimeBetweenDeliveries(orderRes[0], orderId);
          }
        }
      }
      if (req.body.assignee) {
      // To check the status if it is da-unavailable it will be placed or else order status will be same as be before
        if (req.query.action === 'da-unavailable') {
          req.body.status = 'placed';
        }
        res.data = await ordersService.update(obj);
        history.orderHistoryUpdate(orderRes[0], req.body, 'reassign');
      }
      req.body.reporter = req.userId;
      if (res.data) {
        next();
      } else {
        debug('Error while updating partial orders', httpContext.get('requestId'));
        throw new Error();
      }
    }
  },
  deleteOrder: async (req, res, next) => {
    const Id = req.params.orderId;
    res.data = await ordersService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting orders', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getOrderForDeliveryAgent: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '1';
      req.query.sortColumn = 'expectedDeliveryTime';
    }
    if (req.query.pageSize === undefined || req.query.pageNo === undefined) {
      req.query.pageSize = 10;
      req.query.pageNo = 1;
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
    const DAId = req.params.deliveryAgentId;
    if (DAId) {
      obj.query = {
        assignee: utilities.CreateObjectId(DAId),
        status: { $nin: ['cancelled', 'delivered'] },
        createdDate: {
          $gt: new Date(req.query.startDate),
          $lt: new Date(req.query.endDate),
        },
      };
    }
    const totalCountRes = await orderDeliveryAgentService.totalCountForDeliveryAgent(obj);
    const orderRes = await orderDeliveryAgentService.getOrderForDeliveryAgent(obj);
    if (orderRes) {
      const response = { status: true, totalCount: totalCountRes, orders: orderRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing orders related to DA', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getOrderForVendor: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    if (req.query.pageSize === undefined || req.query.pageNo === undefined) {
      req.query.pageSize = 10;
      req.query.pageNo = 1;
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
      query: { vendorId: req.params.vendorId },
    };
    const totalCountRes = await ordersService.totalCount(obj);
    const orderRes = await ordersService.getAll(obj);
    if (orderRes) {
      const response = { status: true, totalCount: totalCountRes, orders: orderRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing orders related to vendor', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getOrderForCrew: async (req, res, next) => {
    const obj1 = {
      query: {
        _id: req.userId,
        userRole: 'crew',
        status: 'active',
      },
    };
    const crewValidationCheck = await userService.getByCustomField(obj1);
    if (crewValidationCheck.length !== 0) {
      const start = moment().format('YYYY-MM-DD HH:mm:ss');
      const end = moment().add(config.api.crewQueueTime, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      const endTime = moment().add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
      debug(start, end, endTime, 'Start and end');
      const deliveryTime = parseInt(config.api.deliveryTime, 10);
      const orderRes = await ordersService.getOrderForCrew(req.params.vendorId, start, end);
      // console.log(orderRes);
      const orderRes1 = await ordersService.getUpcomingOrderForCrew(req.params.vendorId, end, endTime);
      if (orderRes.length !== 0) {
        for (let i = 0; i < orderRes.length; i++) {
          const expectedTime = orderRes[i]._id;
          expectedTime.getMinutes(expectedTime.setMinutes(expectedTime.getMinutes() - deliveryTime));
          orderRes[i]._id = expectedTime;
          for (let j = 0; j < orderRes[i].orders.length; j++) {
            const time = orderRes[i].orders[j].expectedDeliveryTime;
            time.getMinutes(time.setMinutes(time.getMinutes() - deliveryTime));
            let inc = 0;
            for (const item of orderRes[i].orders[j].menuItems) {
              const obj = {
                query: {
                  menuItemId: item.menuItemId._id,
                  orderId: orderRes[i].orders[j]._id,
                },
              };
              const menuItemStatus = await orderItemsService.getByCustomField(obj);
              // const data = Object.assign(orderRes[i].orders[j].menuItems[inc], {
              //   status: menuItemStatus[0].status,
              // });
              orderRes[i].orders[j].menuItems[inc].status = menuItemStatus[0].status;
              inc++;
            }
          }
        }
      }
      // const newArr = [];
      // const oldArr = [];
      // await orderRes.forEach((item) => {
      //   if (item._id > new Date()) {
      //     newArr.push(item);
      //   } else {
      //     oldArr.push(item);
      //   }
      // });
      // const newArr1 = newArr.concat(oldArr);
      if (orderRes) {
        const newArr = orderRes.filter((item) => {
          if (new Date(item._id) >= new Date(start) && new Date(item._id) < new Date(end)) {
            debug('In If condition', new Date(item._id), new Date(start), new Date(end));
            return item;
          }
          // else {
          //   // console.log("In Else");
          //   console.log("In Else", new Date(item._id), new Date(start));
          // }
        });
        const response = { status: true, orders: newArr };
        res.data = response;
        next();
      } else {
        debug('Error while listing orders related to crew', httpContext.get('requestId'));
        throw new Error();
      }
    } else {
      debug('crew does not exist.', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getPastOrdersForCrew: async (req, res, next) => {
    const start = new Date(req.query.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.query.endDate);
    end.setHours(23, 59, 59, 999);
    const condition = [
      { expectedDeliveryTime: { $gte: start, $lt: end } },
      { vendorId: req.params.vendorId },
    ];
    if (req.query.status !== 'all') {
      condition.push({ status: req.query.status });
    } else {
      condition.push({ status: { $nin: ['placed', 'fired'] } });
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: -1,
      sortColumn: 'createdDate',
      query: { $and: condition },
    };
    const totalCountRes = await ordersService.totalCount(obj);
    const orderRes = await ordersService.getAll(obj);
    const finalOrderRes = await GetIssueDetailWithOrder(orderRes);
    if (orderRes) {
      const response = { status: true, totalCount: totalCountRes, orders: finalOrderRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing past orders for crew', httpContext.get('requestId'));
      throw new Error();
    }
  },
  OrderFilters: async (data) => {
    const query = {};
    if (data.filterColumn && data.filterValue) {
      query[data.filterColumn] = data.filterValue;
    }
    if (data.status === 'now') {
      query.status = { $nin: ['cancelled', 'delivered'] };
    } else if (data.status === 'past') {
      query.status = { $in: ['delivered', 'cancelled'] };
    }
    return query;
  },
  refund: async (req, res, next) => {
    debug('refund Initiated');
    res.data = true;
    if (res.data) {
      next();
    } else {
      throw new Error();
    }
  },
  // eslint-disable-next-line consistent-return
  refundOrderAmount: async (req, res, next) => {
    const obj = {
      orderId: req.params.orderId,
    };
    if (req.query.amount) {
      obj.amount = req.query.amount;
    }

    const paymentIntentRes = await ordersService.getById(req.params.orderId);
    if (paymentIntentRes) {
      if (obj.amount < paymentIntentRes.totalAmount) {
        obj.status = 'partialRefund';
      } else {
        obj.status = 'fullRefund';
      }
      obj.originalAmount = paymentIntentRes.totalAmount;
      obj.recipientId = paymentIntentRes.recipientId.toString();
      obj.payment_intent = paymentIntentRes.paymentIntentId;
      const createRefundIntentRes = await stripeService.createRefundIntent(obj);
      if (createRefundIntentRes) {
        res.data = createRefundIntentRes;
        next();
      }
    } else {
      debug('Invalid Order in refund', httpContext.get('requestId'));
      const errorRes = createError(406, Constant.labelList.invalidOrder);
      return next(errorRes);
    }
  },
  notifyUserNotification: async (req, res, next) => {
    const obj = {
      status: 'notifyUser',
      recipientId: req.body.recipientId,
      venueId: req.body.venueId,
      orderId: req.body.orderId,
      deliveryAreaId: req.body.deliveryAreaId,
    };
    await socket.notifyStatus(obj);
    res.data = {};
    res.data.nModified = 1;
    next();
  },
  generateOrderId: async (deliveryAreaId) => {
    const getPrefix = await deliveryAreaService.getById(deliveryAreaId);
    const getCountOfOrder = await ordersService.totalCount();
    // eslint-disable-next-line max-len
    const paddedNumber = await utilities.padNumber(getCountOfOrder + 1, parseInt(config.api.orderPadding, 10));
    const orderId = getPrefix.prefix + paddedNumber;
    return orderId;
  },
  updateDeliveryTime: async (oldOrder, status) => {
    const updateData = {};
    const now = new Date().toJSON();
    let update = false;
    if (status === 'fired') {
      updateData.firedDate = now;
      update = true;
    } else if (status === 'ready') {
      updateData.readyDate = now;
      updateData.cookingTime = utilities.findTimeDifference(oldOrder.firedDate, now);
      update = true;
    } else if (status === 'pickedup') {
      updateData.pickedupDate = now;
      update = true;
    } else if (status === 'arrived') {
      updateData.arrivedDate = now;
      update = true;
    } else if (status === 'delivered') {
      updateData.deliveredDate = now;
      updateData.orderCompletionTime = utilities.findTimeDifference(oldOrder.createdDate, now);
      updateData.deliveryTime = utilities.findTimeDifference(oldOrder.pickedupDate, now);
      update = true;
    }
    if (update) {
      const obj = { Id: oldOrder._id, data: updateData, options: { runValidators: true } };
      ordersService.update(obj);
    }
  },
  addAverageTimeBetweenDeliveries: async (orderDetails, orderId) => {
    const { deliveryAreaId, assignee, vendorId } = orderDetails;
    const start = moment().startOf('day'); // set to 12:00 am today
    const orderQuery = {
      query: {
        _id: { $ne: orderId },
        deliveryAreaId,
        status: 'delivered',
        assignee: assignee._id,
        createdDate: { $gte: new Date(start) },
      },
      pageSize: 1,
      pageNo: 1,
      sortColumn: 'createdDate',
      sortValue: -1,
    };
    const pastOrderRes = await ordersService.getLastOrderByDeliveryAgent(orderQuery);
    if (pastOrderRes.length > 0) {
      const now = new Date().toJSON();
      const deliveryTime = pastOrderRes[0].deliveredDate ? new Date(pastOrderRes[0].deliveredDate) : null;
      if (deliveryTime) {
        debug('past order', now, deliveryTime);
        const timeDiff = utilities.findTimeDifference(deliveryTime, now);
        if (isNaN(timeDiff)) {
          debug('Not a number', timeDiff);
        } else {
          const analyticsData = {
            vendorId,
            deliveryAgentId: assignee,
            deliveryAreaId,
            timeBetweenDeliveries: timeDiff, // In minutes
          };
          // debug('Update analytics', analyticsData);
          analyticsDeliveriesService.save(analyticsData);
        }
      } else {
        debug('No delivery time found for previous order', httpContext.get('requestId'));
      }
    } else {
      debug('Skipe udpate analytics', httpContext.get('requestId'));
    }
  },

};
module.exports = OrdersApi;
