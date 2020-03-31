/* eslint-disable consistent-return */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/orderItems');
const ModelService = require('../services/modelService');
const orderItemsModel = require('../models/orderItems');

const orderItemsService = new ModelService(orderItemsModel);

const updateFunction = async (menuItemList, details, orderId) => {
  const menuItemFired = await menuItemList.filter((x) => details.menuItemId.includes(x));
  if (menuItemFired.length !== 0) {
    menuItemFired.forEach(async (element) => {
      const query = {
        $and: [
          { orderId },
          { menuItemId: element },
        ],
      };
      const data = { status: details.status };
      const obj = { query, data };
      await orderItemsService.updateCustomField(obj);
    });
  }
  return true;
};
const OrderItemsApi = {
  saveOrderItem: async (req, res, next) => {
    try {
      res.data = await orderItemsService.save(req.body);
    } catch (error) {
      debug(`error in save orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getOrderItem: async (req, res, next) => {
    try {
      res.data = await orderItemsService.getById(req.params.orderItemsId);
    } catch (error) {
      debug(`error in getting orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updateOrderItem: async (req, res, next) => {
    try {
      const obj = { Id: req.params.orderItemsId, data: req.body, options: { runValidators: true } };
      res.data = await orderItemsService.update(obj);
    } catch (error) {
      debug(`error in updating orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updatePartialOrderItem: async (req, res, next) => {
    try {
      const obj = { Id: req.params.orderItemsId, data: req.body, options: { runValidators: true } };
      res.data = await orderItemsService.update(obj);
    } catch (error) {
      debug(`error in updating orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  deleteOrderItem: async (req, res, next) => {
    try {
      res.data = await orderItemsService.deleteRemove(req.params.orderItemsId);
    } catch (error) {
      debug(`error in deleteting orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getAllOrderItem: async (req, res, next) => {
    try {
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
      const totalCountRes = await orderItemsService.totalCount();
      const orderItemRes = await orderItemsService.getAll(obj);
      if (orderItemRes) {
        const response = { status: true, totalCount: totalCountRes, orderItems: orderItemRes };
        res.data = response;
      }
    } catch (error) {
      debug(`error in listing orderItems ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updateStatusInOrderItem: async (orderId, details) => {
    let query = { orderId };
    const orderItemRes = await orderItemsService.getByCustomField({ query });
    const menuItemList = [];
    let allowupdation = true;
    if (orderItemRes.length !== 0) {
      await orderItemRes.forEach((element) => {
        menuItemList.push((element.menuItemId).toString());
      });
      const menuItemNotFired = await menuItemList.filter((x) => !details.menuItemId.includes(x));
      if (menuItemNotFired.length !== 0) {
        const isAllowed = await Promise.all(menuItemNotFired.map(async (element, index) => {
          query = {
            $and: [
              { orderId },
              { menuItemId: element },
            ],
          };
          const orderNotFiredFired = await orderItemsService.getByCustomField({ query });
          if (orderNotFiredFired[0].deliverRestOfOrder === false) {
            allowupdation = false;
          }
          if ((index === menuItemNotFired.length - 1) && allowupdation === true) {
            await updateFunction(menuItemList, details, orderId);
          }
          return allowupdation;
        }));
        return isAllowed[0];
      }
      await updateFunction(menuItemList, details, orderId);
      return allowupdation;
    }
  },
};
module.exports = OrderItemsApi;
