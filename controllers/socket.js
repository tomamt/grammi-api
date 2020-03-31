/* eslint-disable no-underscore-dangle */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
/* eslint-disable quotes */
/* eslint-disable eqeqeq */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/socket');
const SocketService = require('../services/socketService');

require('express-async-errors');
const ReferenceModelService = require('../services/referencedModelService');
const Constant = require('../utilities/constant');

const recipientReferences = Constant.reference.recipient;
const vendorReferences = Constant.reference.vendor;
const ModelService = require('../services/orders');
const deviceIdsModel = require('../models/deviceIds');
const vendorsModel = require('../models/vendors');

const vendorsService = new ReferenceModelService(vendorsModel, vendorReferences);
const deviceIdsService = new ReferenceModelService(deviceIdsModel, recipientReferences);
const ordersModel = require('../models/orders');

const references = Constant.reference.order;
const ordersService = new ModelService(ordersModel);
const socketService = new SocketService();
const admin = require('firebase-admin');

const serviceAccount = require('../serviceAccountKey.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount[process.env.serviceAccountEnv]),
  databaseURL: serviceAccount[process.env.serviceAccountEnv].databaseURL,
});
const sendNotification = async (deviceIdRes, data) => {
  let payload;
  let payload1;
  const registrationToken = [];
  const registrationToken1 = [];

  if (deviceIdRes) {
    for (let i = 0; i < deviceIdRes.length; i++) {
      if (deviceIdRes[i].firebaseToken && deviceIdRes[i].deviceType == 'android') {
        registrationToken.push(deviceIdRes[i].firebaseToken);
      } else if (deviceIdRes[i].firebaseToken && deviceIdRes[i].deviceType == 'ios') {
        registrationToken1.push(deviceIdRes[i].firebaseToken);
      }
    }
  }
  payload = {
    data,
    tokens: registrationToken,
  };

  payload1 = {
    // aps: {
    //   alert: {
    //     title: data.title,
    //     body: data.body,
    //   },
    // },
    notification: { title: data.title, body: data.body },
    data,
    tokens: registrationToken1,
  };
  // Send a message to the device corresponding to the provided
  // registration token.
  if (registrationToken.length != 0) {
    admin.messaging().sendMulticast(payload)
      .then((response) => {
      // Response is a message ID string.
        debug(`Successfully sent message for android device: ${response.successCount}`, httpContext.get('requestId'));
      })
      .catch((error) => {
        debug(`Error sending message for android device: ${error}`, httpContext.get('requestId'));
      });
  }
  if (registrationToken1.length != 0) {
    admin.messaging().sendMulticast(payload1)
      .then((response) => {
      // Response is a message ID string.
        debug(`Successfully sent message for ios device: ${response.successCount}`, httpContext.get('requestId'));
      })
      .catch((error) => {
        debug(`Error sending message for ios device: ${error}`, httpContext.get('requestId'));
      });
  }
};

const pushNotification = async (details, res) => {
  debug(`status inside push notification ${details}`, httpContext.get('requestId'));
  const registrationToken = [];
  const registrationToken1 = [];
  let obj = '';
  let obj1 = '';
  let title = '';
  let body = '';
  let crewIds = [];
  let payload;
  let payload1;
  let deviceIdRes;
  if (details == 'forceClockOut' || details == 'locked') {
    obj = { query: { userId: res } };
    const data = {
      userId: res.toString(),
      title: details,
    };
    deviceIdRes = await deviceIdsService.getByCustomField(obj);
    await sendNotification(deviceIdRes, data);
  } else if (details == 'notifyUser') {
    title = 'Please pick up your order ASAP';
    body = 'Your order arrived 5 minutes ago and will be returned if it is not picked up soon.';
    obj = { query: { recipientId: res.recipientId } };
    const data = {
      orderId: res.orderId.toString(),
      recipientId: res.recipientId.toString(),
      venueId: res.venueId.toString(),
      deliveryAreaId: res.deliveryAreaId.toString(),
      title: title.toString(),
      body: body.toString(),
    };
    deviceIdRes = await deviceIdsService.getByCustomField(obj);
    await sendNotification(deviceIdRes, data);
  } else {
    if (res.vendorId.crewIds.length != 0) {
      for (let i = 0; i < res.vendorId.crewIds.length; i++) {
        crewIds.push(res.vendorId.crewIds[i]._id);
      }
    }
    if (res.status == 'da-unavailable') {
      obj = { query: { userId: res.assignee } };
      title = 'You have an incoming order';
    } else if (details == 'placed') {
      crewIds.push(res.assignee._id);
      obj = { query: { userId: { $in: crewIds } } };
      title = 'You have an incoming order';
      if (res.recipientId) {
        const obj2 = { query: { recipientId: res.recipientId } };
        const title1 = `Order accepted`;
        const body1 = 'Your order has been accepted';
        const deviceIdRes2 = await deviceIdsService.getByCustomField(obj2);
        const data1 = {
          orderId: res._id.toString(),
          recipientId: res.recipientId.toString(),
          venueId: res.vendorId.venueId._id.toString(),
          deliveryAreaId: res.deliveryAreaId.toString(),
          title: title1.toString(),
          body: body1.toString(),
        };
        await sendNotification(deviceIdRes2, data1);
      }
    } else if (details == 'fired') {
      obj = { query: { recipientId: res.recipientId } };
      obj1 = { query: { userId: res.assignee._id } };
      title = `Order is being prepared`;
      body = `Your order is being prepared by the restaurant`;
    } else if (details == 'ready') {
      obj = { query: { userId: res.assignee._id } };
      title = `Order is ready`;
      body = `Your order is ready for pickup`;
    } else if (details == 'pickedup') {
      obj = { query: { recipientId: res.recipientId } };
      title = `Order is on its way!`;
      body = `Your order has left the restaurant and is on the way to you.`;
    } else if (details == 'refund') {
      obj = { query: { recipientId: res.recipientId } };
      title = `Your refund amount is initiated`;
    } else if (details == 'arrived') {
      obj = { query: { recipientId: res.recipientId } };
      title = `Order has arrived!`;
      body = `Head to the drop-off location to receive your order.`;
    } else if (details == 'delivered') {
      obj = { query: { recipientId: res.recipientId } };
      title = `Order is delivered`;
      body = `Your order is delivered, enjoy your meal.`;
    } else if (details == 'cancelled' && (res.status == 'placed' || res.status == 'fired')) {
      crewIds.push(res.assignee);
      obj = { query: { recipientId: res.recipientId } };
      obj1 = { query: { userId: { $in: crewIds } } };
      title = `Order has been cancelled`;
      body = `Your order has been cancelled, we regret the inconvenience caused.`;
    } else if (details == 'cancelled' && !(res.status == 'cancelled')) {
      obj = { query: { recipientId: res.recipientId } };
      obj1 = { query: { userId: res.assignee } };
      title = `Order has been cancelled`;
      body = `Your order has been cancelled, we regret the inconvenience caused.`;
    } else if (details == 'consumer-issue' && (res.status == 'placed' || res.status == 'fired')) {
      crewIds.push(res.assignee);
      obj = { query: { userId: { $in: crewIds } } };
      title = `Order has been cancelled`;
      body = `Your order has been cancelled, we regret the inconvenience caused.`;
    } else if (details == 'consumer-issue' && !(res.status == 'cancelled')) {
      obj = { query: { userId: res.assignee } };
      title = `Order has been cancelled`;
      body = `Your order has been cancelled, we regret the inconvenience caused.`;
    } else if (details == 'reassign') {
      obj = { query: { userId: res.assignee } };
      title = `You have an incoming order`;
    }

    if (obj != '') {
      deviceIdRes = await deviceIdsService.getByCustomField(obj);
    }
    if (obj1 != '') {
      const deviceIdRes1 = await deviceIdsService.getByCustomField(obj1);
      if (deviceIdRes1.length != 0) {
        deviceIdRes = deviceIdRes.concat(deviceIdRes1);
      }
    }
    const data = {
      orderId: res._id.toString(),
      recipientId: res.recipientId.toString(),
      venueId: res.vendorId.venueId._id.toString(),
      deliveryAreaId: res.deliveryAreaId.toString(),
      title: title.toString(),
      body: body.toString(),
    };
    await sendNotification(deviceIdRes, data);
  }
};
const socketTrigger = {
  updateOrderStatus: async (req, res) => {
    switch (req.status) {
      case 'pickedup': await socketService.sendToSocket('order-pickedup', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'fired': await socketService.sendToSocket('order-fired', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'placed': await socketService.sendToSocket('order-placed', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'ready': await socketService.sendToSocket('order-ready', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'arrived': await socketService.sendToSocket('order-arrived', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'delivered': await socketService.sendToSocket('order-delivered', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'cancelled': await socketService.sendToSocket('order-cancelled', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'da-issue': await socketService.sendToSocket('order-da-issue', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'crew-issue': await socketService.sendToSocket('order-crew-issue', JSON.stringify(req.res)); pushNotification(req.status, req.res); break;
      case 'payments': await socketService.sendToSocket('payments', JSON.stringify(req.res)); break;
      case 'consumer-issue': pushNotification(req.status, req.res); break;
      case 'reassign': await pushNotification('reassign', req.res); break;
      default: debug("In default case");
    }
    return res;
  },
  updateIssueStatus: async (req, res) => {
    switch (req.status) {
      case 'consumer-issue': await socketService.sendToSocket('alert-consumer-issue', JSON.stringify(req.res)); break;
      case 'da-issue': await socketService.sendToSocket('alert-da-issue', JSON.stringify(req.res)); break;
      case 'crew-issue': await socketService.sendToSocket('alert-crew-issue', JSON.stringify(req.res)); break;
      case 'da-break': await socketService.sendToSocket('da-break', JSON.stringify(req.res)); break;
      case 'da-unavailable': await socketService.sendToSocket('da-unavailable', JSON.stringify(req.res)); break;
      default: debug("In default");
    }
    return res;
  },
  saveOrderStatus: async (req, res) => {
    const newOrder = await socketService.sendToSocket('new-order', JSON.stringify(req));
    pushNotification('placed', req);
    return res;
  },
  refundOrderStatus: async (req, res) => {
    pushNotification('refund', req);
  },
  forceClockOutStatus: async (req, res) => {
    pushNotification(req.status, req.id);
  },
  notifyStatus: async (req, res) => {
    pushNotification(req.status, req);
  },
};
module.exports = socketTrigger;
