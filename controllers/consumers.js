/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
/* eslint-disable no-multi-assign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/consumer');
const createError = require('http-errors');
const uuidv4 = require('uuid/v4');
const Moment = require('moment');
const config = require('../config/config');
const ConsumerModelService = require('../services/consumersModelService');
const CartsModelService = require('../services/cartsModelService');
const ModelService = require('../services/modelService');
const OrderModelService = require('../services/orders');
// const convertTimeSlotToDateTime = require('../services/timeSlot');
const ReferenceModelService = require('../services/referencedModelService');
const twilio = require('../services/twilio');
const Constant = require('../utilities/constant');
const utilities = require('../utilities/utilities');
const stripeService = require('../services/stripe');

const orders = require('./orders');
const history = require('./orderHistory');
const issuesModel = require('../models/issues');
const menuItemsModel = require('../models/menuItems');
const dropdownsModel = require('../models/dropdowns');
const venuesModel = require('../models/venues');
const deliveryLocationsModel = require('../models/deliveryLocations');
const deliveryAreasModel = require('../models/deliveryAreas');
const recipientsModel = require('../models/recipients');
const deviceIdsModel = require('../models/deviceIds');
const ordersModel = require('../models/orders');
const orderItemsModel = require('../models/orderItems');
const cartsModel = require('../models/carts');
const ratingsModel = require('../models/ratings');
const vendorMenuSectionsModel = require('../models/vendorMenuSections');
const vendorModel = require('../models/vendors');
const agentsWorkingHoursModel = require('../models/deliveryAgentsWorkingHours');
const vendorOperatingHoursModel = require('../models/vendorOperatingHours');
const menuItemAvailableHours = require('../models/menuItemAvailableHours');
const discountCodesModel = require('../models/discountCodes');
const transactionsModel = require('../models/transactions');
const usersModel = require('../models/users');
const consumerDiscountCodesModel = require('../models/consumerDiscountCodes');
const deliveryAgentsModel = require('../models/deliveryAgents');

const VendorReferences = Constant.reference.vendor;
const venueReferences = Constant.reference.venue;
const deliveryReferences = Constant.reference.deliveryLocation;
const deliveryAreaReferences = Constant.reference.deliveryArea;
const recipientReferences = Constant.reference.recipient;
const cartReferences = Constant.reference.cart;
const references = Constant.reference.issue;
const menuReferences = Constant.reference.menuItem;
const consumerDiscountReferences = Constant.reference.consumerDiscountCode;

const deliveryAreasService = new ConsumerModelService(deliveryAreasModel);
const menuItemsService = new ConsumerModelService(menuItemsModel);
const menuItemsGeneralService = new ModelService(menuItemsModel);
const vendorMenuSectionsService = new ConsumerModelService(vendorMenuSectionsModel);
const dropDownService = new ModelService(dropdownsModel);
const venuesService = new ReferenceModelService(venuesModel, venueReferences);
const orderService = new ModelService(ordersModel);
const cartsService = new ModelService(cartsModel);
const cartsExtendedService = new CartsModelService(cartsModel);
const ratingsService = new ModelService(ratingsModel);
const orderItemsService = new ModelService(orderItemsModel);
const agentsWorkingHoursService = new ConsumerModelService(agentsWorkingHoursModel);
const deliveryLocationsService = new ReferenceModelService(deliveryLocationsModel, deliveryReferences);
const deliveryLocationsGeneralService = new ModelService(deliveryLocationsModel);
// const deliveryAreasService = new ReferenceModelService(deliveryAreasModel, deliveryAreaReferences);
const recipientsService = new ReferenceModelService(recipientsModel, recipientReferences);
const deviceIdsService = new ReferenceModelService(deviceIdsModel, recipientReferences);
const vendorGeneralService = new ReferenceModelService(vendorModel, VendorReferences);
const vendorService = new ConsumerModelService(vendorModel);
const vendorOperatingHoursService = new ConsumerModelService(vendorOperatingHoursModel);
const menuItemAvailableHoursService = new ConsumerModelService(menuItemAvailableHours);
const discountCodesService = new ConsumerModelService(discountCodesModel);
const transactionService = new ModelService(transactionsModel);
const userService = new ModelService(usersModel);
const issuesService = new ReferenceModelService(issuesModel, references);
const userConsumerService = new ConsumerModelService(usersModel);
const orderConsumerService = new OrderModelService(ordersModel, menuReferences);
const consumerDiscountConsumerService = new ConsumerModelService(consumerDiscountCodesModel);
const consumerDiscountService = new ReferenceModelService(consumerDiscountCodesModel, consumerDiscountReferences);
const deliveryAgentsService = new ModelService(deliveryAgentsModel, []);

// check active vendor for venue
const validVendorList = async (vendorList) => {
  const vendors = [];
  await Promise.all(vendorList.map(async (element) => {
    const query = {
      $and: [
        { _id: element.userId },
        { status: 'active' },
      ],
    };
    const isOpen = await userConsumerService.IsActive(query);
    if (isOpen.length !== 0) {
      debug('In Valid Vendor List', httpContext.get('requestId'));
      // eslint-disable-next-line no-underscore-dangle
      vendors.push(element._id);
    }
  }));
  return vendors;
};

// Check delivery agent availability
const availableDeliveryAgents = async (venueId) => {
  const agentList = [];
  const list = await agentsWorkingHoursService.deliveryAgentAvailable(venueId);
  list.forEach((element) => {
    agentList.push(element.userId);
  });
  return agentList;
};
// All clocked in da
// Find da based on orderArea they served last order
// Find da based on minimum orders assigned the current day
// Find da those are active at the time order
const availableDeliveryAgentsByArea = async (areaId) => {
  const daList = {};
  const inOrderArea = [];
  const outOrderArea = [];
  const list = await agentsWorkingHoursService.deliveryAgentAvailableByArea(areaId, '');
  const activeDa = list.filter((person) => person.users.status === 'active'); // filter blocked delivery agents
  activeDa.forEach((element) => { // Find da based on orderArea they served last order
    if (element.dalist) {
      if (element.dalist.deliveryAreaId && element.dalist.deliveryAreaId.toString() === areaId.toString()) {
        inOrderArea.push({ id: element.users._id, order: element.orders.length });
      } else {
        outOrderArea.push({ id: element.users._id, order: element.orders.length });
      }
    } else { // exception case for old da's
      debug('exception case');
      outOrderArea.push({ id: element.users._id, order: element.orders.length });
    }
  });
  // Sort da based on order count
  // eslint-disable-next-line prefer-arrow-callback
  inOrderArea.sort((a, b) => a.order - b.order);
  // eslint-disable-next-line prefer-arrow-callback
  outOrderArea.sort(function (a, b) {
    return a.order - b.order;
  });
  daList.inOrderArea = inOrderArea;
  daList.outOrderArea = outOrderArea;
  return daList;
};
// Calculate Delivery time
const calcDeliveryTime = async (menuDetails) => {
  debug('req host id in Order Delivery Time slot inside CalcDelivery ', httpContext.get('requestId'));
  const menuPreparationTime = [];
  await Promise.all(menuDetails.map(async (element) => {
    const GetPreparationTime = await menuItemsService.getById(element.menuItemId);
    menuPreparationTime.push(GetPreparationTime.preparationTime);
  }));
  const preparationTime = Math.max.apply(0, menuPreparationTime);
  const deliveryTime = parseInt(config.api.deliveryTime, 10) + preparationTime;
  return deliveryTime;
};

// Get time slot list for order
const getTimeSlotForOrder = async (deliveryTime) => {
  const timeInterval = config.api.timeSlotInterval;
  const tommorowTimeSlot = [];
  const todayTimeSlot = [];
  const today = new Moment().format('YYYY-MM-DD HH:mm:ss');
  let currentMin = Moment(today).add(deliveryTime, 'minutes').format('mm');
  let currentHour = Moment(today).add(deliveryTime, 'minutes').format('HH');
  // round the time next 15mins
  currentMin = Math.ceil(currentMin / timeInterval) * timeInterval;
  currentMin = currentMin < 10 ? `0${currentMin}` : currentMin;
  if (currentMin === 60) {
    currentHour = parseFloat(currentHour) + 1;
    currentHour = Moment(currentHour).format('HH');
    currentMin = '00';
  }
  currentHour = currentHour < 10 ? `0${currentHour}` : currentHour;
  const timeSlot1 = `${currentHour}:${currentMin}`;
  let startTime1 = Moment(timeSlot1, 'HH:mm').format('YYYY-MM-DD HH:mm:ss');
  const endTime1 = Moment('23:45', 'HH:mm').format('YYYY-MM-DD HH:mm:ss');
  let startTime2 = Moment('00:00', 'HH:mm').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
  const endTime2 = Moment(startTime1).add(12, 'hours').format('YYYY-MM-DD HH:mm:ss');
  // get the diff
  const start = Moment(timeSlot1, 'HH:mm');
  const end = Moment(startTime1).add(12, 'hours');
  const startDate = Moment(start).format('YYYY-MM-DD');
  const endDate = Moment(end).format('YYYY-MM-DD');
  // Timeslot for today date
  for (let i = 0; startTime1 <= endTime1; i += 1) {
    todayTimeSlot.push(startTime1);
    startTime1 = Moment(startTime1).add(parseInt(timeInterval, 10), 'minutes').format('YYYY-MM-DD HH:mm:ss');
  }
  // Timeslot for next date
  if (startDate !== endDate) {
    for (let i = 0; startTime2 <= endTime2; i += 1) {
      tommorowTimeSlot.push(startTime2);
      startTime2 = Moment(startTime2).add(parseInt(timeInterval, 10), 'minutes').format('YYYY-MM-DD HH:mm:ss');
    }
  }
  const TimeSlotData = { todayTimeSlot, tommorowTimeSlot };
  const Data = { TimeSlotData, startTime: start, endTime: end };
  return Data;
};

// Check Vendor is availability
const isVendorOpen = async (Id) => {
  const today = new Date();
  const todayDay = today.getDay();

  const query1 = {
    $and: [
      { _id: Id },
      { status: 'active' },
    ],
  };
  const query2 = {
    $and: [
      { vendorId: Id },
      { dayOfWeek: todayDay },
    ],
  };
  const IsVendorActive = await vendorService.IsActive(query1);

  if (IsVendorActive.length !== 0) {
    const isOpen = await vendorOperatingHoursService.IsOpen(query2);

    if (isOpen.length !== 0) {
      return true;
    }
  }
  return false;
};

// Check Menu Item availability
const isMenuItemAvail = async (menuItems, timeSlotList, deliveryTime) => {
  const startTime = Moment(timeSlotList.startTime).format('HH.mm');
  const endTime = Moment(timeSlotList.endTime).format('HH.mm');
  debug('startTime', startTime);
  debug('endTime', endTime);
  const currentTime = Moment().format('HH.mm');
  const todayTimesSlot = timeSlotList.TimeSlotData.todayTimeSlot;
  const nextDayTimeSLot = timeSlotList.TimeSlotData.tommorowTimeSlot;
  const todayCloseTime = [];
  const todayOpenTime = [];
  const nextDayOpenTime = [];
  const nextDayCloseTime = [];
  const today = [];
  const tommorow = [];
  const todayDay = Moment().weekday();
  const nextDay = todayDay === 7 ? 1 : (todayDay + 1);
  const time = parseFloat(startTime).toFixed(2);
  const currentTimes = parseFloat(currentTime);
  const nextDayTime = parseFloat(endTime);
  let menuNotAvail = false;
  let timeSlot;
  await Promise.all(menuItems.map(async (element) => {
    const query = {
      $and: [
        { menuItemId: element.menuItemId },
        {
          $or: [
            { dayOfWeek: todayDay },
            { dayOfWeek: nextDay },
          ],
        },
      ],
    };
    const requiredTimeDetails = [];
    const isOpen = await menuItemAvailableHoursService.IsOpen(query);
    if (isOpen.length !== 0) {
      isOpen.forEach((item) => {
        if (parseInt(item.dayOfWeek, 10) === todayDay) {
          if (parseFloat(item.closing).toFixed(2) > time) {
            requiredTimeDetails.push({ day: item.dayOfWeek, closing: item.closing });
            todayCloseTime.push(item.closing);
            todayOpenTime.push(item.opening);
          }
        }
        if (parseInt(item.dayOfWeek, 10) === nextDay && nextDayTimeSLot.length !== 0) {
          if ((parseFloat(item.opening) <= nextDayTime)) {
            requiredTimeDetails.push({ day: item.dayOfWeek, closing: item.closing });
            nextDayOpenTime.push(item.opening);
            nextDayCloseTime.push(item.closing);
          }
        }
      });
    } else if (isOpen.length === 0 && element.deliverRestOfOrder === false) {
      menuNotAvail = true;
    }
  }));
  debug('todayCloseTime', todayCloseTime);
  debug('todayOpenTime', todayOpenTime);
  if (menuNotAvail === false) {
    const maxMenuAvailTime = Math.max.apply(0, todayCloseTime);
    const minMenuAvailTime = Math.max.apply(0, todayOpenTime);
    let todayClosingTime;
    let todayOpeningTime;
    if (todayCloseTime.length !== 0) {
      debug('minMenuAvailTime', minMenuAvailTime);
      debug('currentTimes', currentTimes);
      if (minMenuAvailTime < currentTimes) {
        debug('11111');
        todayOpeningTime = Moment(currentTimes, 'HH:mm').add(deliveryTime, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      } else {
        debug('22222');
        todayOpeningTime = Moment(minMenuAvailTime, 'HH:mm').add(deliveryTime, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      }
      if (nextDayCloseTime.length === 0) {
        todayClosingTime = Moment(maxMenuAvailTime, 'HH:mm').format('YYYY-MM-DD HH:mm:ss');
      } else {
        todayClosingTime = Moment('23.45', 'HH:mm').format('YYYY-MM-DD HH:mm:ss');
      }
      for (let i = 0; i < todayTimesSlot.length; i += 1) {
        if (todayTimesSlot[i] <= todayClosingTime && todayTimesSlot[i] >= todayOpeningTime) {
          // today.push(Moment.utc(todayTimesSlot[i]));
          today.push(new Date(todayTimesSlot[i]));
          // today.push(Moment(todayTimesSlot[i]).tz('America/New_York'));
        }
      }
    }
    if (nextDayCloseTime.length !== 0) {
      let finalEndTime;
      let minMenuAvailTime2 = Math.max.apply(0, nextDayOpenTime);
      minMenuAvailTime2 = parseFloat(minMenuAvailTime2).toFixed(2);
      const maxMenuAvailTime2 = Math.max.apply(0, nextDayCloseTime);
      if (parseFloat(maxMenuAvailTime2) > parseFloat(endTime)) {
        finalEndTime = Moment(endTime, 'HH:mm').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
      } else {
        finalEndTime = Moment(maxMenuAvailTime2, 'HH:mm').add(1, 'day').format('YYYY-MM-DD HH:mm:ss');
      }
      const nextDayStartTime = Moment(minMenuAvailTime2, 'HH:mm').add(1, 'day').add(deliveryTime, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      for (let i = 0; i < nextDayTimeSLot.length; i += 1) {
        if (nextDayTimeSLot[i] <= finalEndTime && nextDayTimeSLot[i] >= nextDayStartTime) {
          // tommorow.push(Moment.utc(nextDayTimeSLot[i]));
          today.push(new Date(todayTimesSlot[i]));
          // tommorow.push(Moment(nextDayTimeSLot[i]).tz('America/New_York'));
        }
      }
    }
    timeSlot = today.concat(tommorow);
  }
  if (timeSlot !== undefined && timeSlot.length !== 0) {
    return timeSlot;
  }
  return false;
};

// Check MenuList of same vendor
const isMenuOfSameVendor = async (menuItemList, vendor) => {
  let sameVendor = true;
  await Promise.all(menuItemList.map(async (element) => {
    const Id = element.menuItemId;
    const IsMenuOfSameVendor = await menuItemsService.IsMenuOfSameVendor(Id, vendor);
    if (IsMenuOfSameVendor.length === 0) {
      sameVendor = false;
    }
  }));
  return sameVendor;
};


// Calculate the toltal amount for cart
const calculateTotalAmount = async (venueDetails, subTotal) => {
  let extraFieldAmount = 0;
  if (JSON.stringify(venueDetails.extraField) !== '{}') {
    const isPercent = venueDetails.extraField.valueType.includes('%');
    if (isPercent === true) {
      extraFieldAmount = (venueDetails.extraField.value / 100) * subTotal;
    } else {
      extraFieldAmount = venueDetails.extraField.value;
    }
  }
  const tax = venueDetails.tax.split('%').join('');
  const deliveryCharge = venueDetails.deliveryCharge.replace(/\D/g, '');
  const packingCharge = venueDetails.packingCharge.replace(/\D/g, '');
  const taxAmount = (tax / 100) * subTotal;
  let totalAmount = parseFloat(subTotal) + parseFloat(taxAmount)
  + parseFloat(deliveryCharge) + parseFloat(packingCharge);
  totalAmount = extraFieldAmount === 0 ? totalAmount : totalAmount + extraFieldAmount;
  const amountData = {
    taxAmount: parseFloat(taxAmount),
    totalAmount: parseFloat(totalAmount),
    deliveryCharge: parseFloat(deliveryCharge),
    packingCharge: parseFloat(packingCharge),
  };
  return amountData;
};
// Handle delayed webhook case
const handlingDelayedWebhook = async (paymentIntentId) => {
  const paymentIntentRes = await stripeService.RetrievePaymentIntent(paymentIntentId);
  if (paymentIntentRes.status === 'succeeded') {
    await ConsumersApi.paymentIntentSuccess(paymentIntentRes);
  } else {
    debug('payment failed cases');
  }
  return paymentIntentRes;
};
// Validate discount coupon
const isCouponValid = async (coupon, venuesId, recipientsId) => {
  debug('In isCouponValid', httpContext.get('requestId'));
  const isValidQuery = {
    query: {
      $and: [
        { code: coupon },
        { status: 'active' },
        { venueId: venuesId },
        { startDate: { $lt: new Date() } },
        { endDate: { $gt: new Date() } },
      ],
    },
  };
  const couponDetails = await discountCodesService.getByCustomField(isValidQuery);
  if (couponDetails.length !== 0) {
    const query = {
      recipientId: recipientsId,
      // eslint-disable-next-line no-underscore-dangle
      discountCodeId: couponDetails[0]._id.toString(),
    };
    const obj = { query };
    const couponUsedTimes = await consumerDiscountConsumerService.totalCount(obj);
    if (couponUsedTimes >= parseInt(couponDetails[0].usageLimit, 10)) {
      return 0;
    }
    return couponDetails;
  }
  return -1;
};


const ConsumersApi = {
  getVenueMenuItem: async (req, res, next) => {
    const Id = req.params.deliveryAreaId;
    let errorRes;
    const obj1 = {};
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    if (req.query.pageSize === undefined || req.query.pageNo === undefined) {
      req.query.pageSize = 10;
      req.query.pageNo = 1;
    }
    const menuItemForVendors = await menuItemsService.getVendorByVenueId(Id);
    if (menuItemForVendors.length !== 0) {
      const vendors = await validVendorList(menuItemForVendors);
      if (vendors.length !== 0) {
        const obj = {
          pageSize: req.query.pageSize,
          pageNo: req.query.pageNo,
          sortValue: req.query.sortValue,
          sortColumn: req.query.sortColumn,
        };
        if (!req.query.search) {
          obj.query = {
            $and: [
              { vendorId: { $in: vendors } },
              { status: 'active' },
            ],
          };
        } else {
          obj.query = {
            $and: [
              { vendorId: { $in: vendors } },
              { name: { $regex: req.query.search, $options: 'i' } },
              { status: 'active' },
            ],
          };
          obj1.query = {
            $and: [
              { _id: { $in: vendors } },
              { name: { $regex: req.query.search, $options: 'i' } },
              { status: 'active' },
            ],
          };
        }
        const totalCountRes = await menuItemsService.totalCount(obj);
        // const vendorMenuRes = await vendorService.getByCustomField(obj1);
        const menuItemRes = await menuItemsService.getAll(obj);
        // const menuItemRes = menuItemRes1.map((item) => {
        //   const menuItemAvailableDateTime = convertTimeSlotToDateTime(item.menuItemAvailableTime);
        //   const itemCopy = { ...item };
        //   itemCopy.menuItemAvailableDateTime = menuItemAvailableDateTime;
        //   return itemCopy;
        // });
        if (menuItemRes) {
          let index = 0;
          let chunk = 0;
          let count = 0;
          // const menuItemResult = menuItemRes.concat(vendorMenuRes);
          const arrayLength = menuItemRes.length;
          const tempArray = [];
          for (index = 0; index < arrayLength; index += chunk) {
            if (chunk === 2) {
              if (count === 0) {
                chunk = 1;
                count += 1;
              } else {
                chunk = 2;
                count = 0;
              }
            } else if (chunk === 1) {
              chunk = 3;
            } else {
              chunk = 2;
            }
            const myChunk = menuItemRes.slice(index, index + chunk);
            tempArray.push(myChunk);
          }
          const response = {
            status: true,
            menuItemTotalCount: totalCountRes,
            menuItem: tempArray,
          };
          res.data = response;
          next();
        } else {
          debug('Error Occured while listing menuItems from Venue Menu Item', httpContext.get('requestId'));
          throw new Error();
        }
      } else {
        debug('Error Occured for Vendor Not Available after validating vendors in Venue Menu Item', httpContext.get('requestId'));
        errorRes = createError(422, Constant.labelList.vendorNotAvail);
        return next(errorRes);
      }
    } else {
      debug('Error Occured for Vendor Not Available in Venue Menu Item', httpContext.get('requestId'));
      errorRes = createError(422, Constant.labelList.vendorNotAvail);
      return next(errorRes);
    }
  },
  getVendorMenuItem: async (req, res, next) => {
    let errorRes;
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
      query: {
        $and: [
          { menuItems: { $exists: true, $not: { $size: 0 } } },
          { vendorId: req.params.vendorId },
        ],
      },
    };
    const query = {
      $and: [
        { _id: req.params.vendorId },
        { status: 'active' },
      ],
    };
    const condition = { query };
    const vendorRes = await vendorGeneralService.getByCustomField(condition);
    if (vendorRes.length !== 0) {
      const totalCountRes = await vendorMenuSectionsService.totalCount(obj);
      const menuItemRes = await vendorMenuSectionsService.getMenuItemByMenuSection(obj);
      if (menuItemRes) {
        const response = {
          status: true,
          vendorDetails: vendorRes,
          menuItemTotalCount: totalCountRes,
          menuDetails: menuItemRes,
        };
        res.data = response;
        next();
      } else {
        debug('Error Occured while listing menuItems from Vendor Menu Item', httpContext.get('requestId'));
        throw new Error();
      }
    } else {
      debug('Error Occured for Invalid Vendor in Vendor Menu Item', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVendor);
      return next(errorRes);
    }
  },
  getGeneralSettings: async (req, res, next) => {
    debug('httpContext.getAll', httpContext.get('requestId'));
    const generalResponse = { status: true };
    const cancellationQuery = { query: { type: 'consumerCancellationReason' } };
    const paymentMethodQuery = { query: { type: 'paymentMethod' } };
    const listOfArguments = [venuesService.getAll({}), deliveryLocationsService.getAll({}),
      dropDownService.getByCustomField(cancellationQuery), dropDownService.getByCustomField(paymentMethodQuery),
      deliveryAreasService.getDeliveryArea()];
    Promise.all(listOfArguments)
      .then((values) => {
        generalResponse.venues = values[0];
        generalResponse.deliveryLocations = values[1];
        generalResponse.consumerCancellationReason = values[2];
        generalResponse.paymentMethods = values[3];
        generalResponse.deliveryAreas = values[4];
        res.data = generalResponse;
        next();
      }).catch((error) => {
        // debug(`Error in promises ${error}`);
        debug(`Error in promises ${error}`, httpContext.get('requestId'));
        throw new Error(Constant.labelList.serverError);
      });
  },
  createPayment: async (req, res, next) => {
    let errorRes;
    const { venueId, cartId, recipientId } = req.params;
    const venueRes = await venuesService.getById(venueId);
    const recipientRes = await recipientsService.getById(recipientId);
    const cartRes = await cartsService.getById(cartId);
    if (!venueRes) {
      debug('Error Occured for Invalid Venue in create payment', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
    if (!recipientRes) {
      debug('Error Occured for Invalid Recipient in create payment', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidRecipient);
      return next(errorRes);
    }
    if (!cartRes) {
      debug('Error Occured for Invalid Cart in create payment', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCart);
      return next(errorRes);
    }
    const totalAmount = await ConsumersApi.calculatePaymentAmount(cartId);
    debug(`Total Amount after Calculation in create payment ${totalAmount}`, httpContext.get('requestId'));
    const paymentIntent = {
      amount: totalAmount,
      metadata: { cartId },
    };
    const createPaymentIntentRes = await stripeService.createPaymentIntent(paymentIntent);
    res.data = {
      status: true,
      clientSecret: createPaymentIntentRes.client_secret,
      paymentIntentId: createPaymentIntentRes.id,
    };
    next();
  },
  createRecipient: async (req, res, next) => {
    let errorRes;
    let recipientId;
    let verificationStatus = 'pending';
    const { venueId, cartId } = req.params;
    const venueRes = await venuesService.getById(venueId);
    const cartRes = await cartsService.getById(cartId);
    if (!venueRes) {
      debug('Error Occured for Invalid Venue in create recipient', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
    if (!cartRes) {
      debug('Error Occured for Invalid Cart in create recipient', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCart);
      return next(errorRes);
    }
    req.body.phoneNumber = req.body.phoneNumber.replace('+', '');
    const resData = {};
    const isValidQuery = { query: { phoneNumber: req.body.phoneNumber } };
    const recipientRes = await recipientsService.getByCustomField(isValidQuery);
    if (recipientRes.length === 0) { // New User
      const smsRes = await twilio.createVerification(req.body);
      debug(`SMS response for New User : ${JSON.stringify(smsRes)}`, httpContext.get('requestId'));
      const saveRecipientRes = await recipientsService.save(req.body);
      recipientId = saveRecipientRes._id;
      resData.recipientVerified = false;
      resData.recipientId = recipientId;
    } else { // Existing user
      recipientId = recipientRes[0]._id;
      const verified = recipientRes[0].verification;
      const isDeviceExistsQuery = {
        query: {
          deviceId: req.body.deviceId,
          recipientId,
          verification: 'verified',
        },
      };
      const deviceIdRes = await deviceIdsService.getByCustomField(isDeviceExistsQuery);
      if (deviceIdRes.length > 0) { // existing user new Device
        debug('User Device Verified', httpContext.get('requestId'));
        resData.recipientVerified = true;
        resData.recipientId = recipientId;
        verificationStatus = 'verified';
      } else {
        debug('Existing user new device', httpContext.get('requestId'));
        const smsRes = await twilio.createVerification(req.body);
        resData.recipientVerified = false;
        resData.recipientId = recipientId;
      }
    }
    const deviceIdQuery = {
      query: { deviceId: req.body.deviceId, firebaseToken: req.body.firebaseToken },
      data: {
        deviceId: req.body.deviceId,
        recipientId,
        firebaseToken: req.body.firebaseToken,
        deviceType: req.body.deviceType,
        verification: verificationStatus,
      },
      options: { upsert: true },
    };
    await deviceIdsService.updateCustomField(deviceIdQuery); // Update deviceId
    res.data = resData;
    next();
  },
  verifyOtp: async (req, res, next) => {
    let errorRes;
    const { venueId, recipientId, cartId } = req.params;
    const { deviceId } = req.body;
    const venueRes = await venuesService.getById(venueId);
    const recipientRes = await recipientsService.getById(recipientId);
    const cartRes = await cartsService.getById(cartId);
    if (!venueRes) {
      debug('Error Occured for Invalid Venue in verify otp', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
    if (!recipientRes) {
      debug('Error Occured for Invalid Recipient in verify otp', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidRecipient);
      return next(errorRes);
    }
    if (!cartRes) {
      debug('Error Occured for Invalid Cart in verify otp', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCart);
      return next(errorRes);
    }
    const smsRes = await twilio.checkVerification(req.body);
    debug(`SMS response for Otp : ${JSON.stringify(smsRes)}`, httpContext.get('requestId'));
    const verifyRes = {};
    if (smsRes.status === 'approved') {
      verifyRes.recipientVerified = true;
      verifyRes.recipientId = recipientRes._id;
      const recipientUpdate = {
        query: { phoneNumber: req.body.phoneNumber },
        data: { verification: 'approved' },
      };
      await recipientsService.updateCustomField(recipientUpdate); // Update deviceId
      const deviceIdQuery = {
        query: { deviceId, recipientId: recipientRes._id },
        data: { verification: 'verified' },
      };
      const updateRes = await deviceIdsService.updateCustomField(deviceIdQuery); // Update verificaiton status
    } else {
      debug('Error Occured for Invalid Otp', httpContext.get('requestId'));
      verifyRes.recipientVerified = false;
      verifyRes.message = Constant.errorName.invalidOtp;
    }
    res.data = verifyRes;
    next();
  },
  orderStatusChange: async (req, res, next) => {
    let errorRes;
    const { cancellationReasonId, comment } = req.body;
    const { orderId, venueId, recipientId } = req.params;
    const venueRes = await venuesService.getById(venueId);
    const dropDownRes = await dropDownService.getById(cancellationReasonId);
    const recipientRes = await recipientsService.getById(recipientId);
    const orderRes = await orderService.getById(orderId);
    if (!venueRes) {
      debug('Error Occured for Invalid Venue in Order Status change', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
    if (!recipientRes) {
      debug('Error Occured for Invalid Recipient in Order Status change', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidRecipient);
      return next(errorRes);
    }
    if (!orderRes) {
      debug('Error Occured for Invalid Order in Order Status change', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidOrder);
      return next(errorRes);
    }
    if (!dropDownRes) {
      debug('Error Occured for Invalid Issue in Order Status change', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidIssueReason);
      return next(errorRes);
    }
    const issue = {
      orderId,
      recipientId,
      comment: comment || null,
      orderProblemId: cancellationReasonId,
      type: 'consumer-issue',
    };
    req.body.recipientId = req.params.recipientId;
    await issuesService.save(issue);
    const obj = { Id: orderId, data: req.body, options: { runValidators: true } };
    await orderService.update(obj);
    // Update OrderHistory
    req.body.recipientId = recipientId;
    history.orderHistoryUpdate(orderRes, req.body, 'status-change');
    res.data = {
      status: true,
      message: Constant.labelList.updateSuccess,
    };
    next();
  },
  GetAllConsumerOrder: async (req, res, next) => {
    let errorRes;
    const { venueId, recipientId } = req.params;
    const venueRes = await venuesService.getById(venueId);
    const recipientRes = await recipientsService.getById(recipientId);
    if (!venueRes) {
      debug('Error Occured for Invalid Venue while listing recipient orders', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
    if (!recipientRes) {
      debug('Error Occured for Invalid Recipient while listing recipient orders', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidRecipient);
      return next(errorRes);
    }
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
      sortColumn: req.query.sortColumn,
      sortValue: req.query.sortValue,
    };
    obj.query = {
      recipientId,
    };
    if (req.query.filterColumn && req.query.filterValue) {
      const filter = req.query.filterValue;
      if (filter === 'now') { // show all undelivered items
        obj.query.status = { $nin: ['cancelled', 'delivered'] };
      } else if (filter === 'past') {
        obj.query.status = { $in: ['delivered'] };
      } else if (filter === 'all') {
        obj.query.status = { $nin: ['cancelled', 'issue'] };
      } else {
        obj.query[req.query.filterColumn] = req.query.filterValue;
      }
    }
    let totalCountRes = await orderConsumerService.totalCount(obj);
    const data = {};
    const ratingOrderList = [];
    const oderFromRating = await ratingsService.getAll(data);
    const orderListRating = await oderFromRating.forEach((element) => {
      ratingOrderList.push(element.orderId);
    });
    if (ratingOrderList.length !== 0) {
      obj.query._id = { $nin: ratingOrderList };
    }
    let orderRes = await orderConsumerService.getAll(obj);
    if (orderRes) {
      if (req.query.filterColumn === 'paymentIntentId') { // If the webhook delayed handle
        if (orderRes.length === 0) {
          await handlingDelayedWebhook(req.query.filterValue);
          totalCountRes = await orderConsumerService.totalCount(obj);
          orderRes = await orderConsumerService.getAll(obj);
        }
      }
      const response = { status: true, totalCount: totalCountRes, orders: orderRes };
      res.data = response;
      next();
    } else {
      debug('Error Occured while listing recipient orders', httpContext.get('requestId'));
      throw new Error();
    }
  },
  GetOrder: async (req, res, next) => {
    await orders.getOrder(req, res, () => {});
    next();
  },
  rating: async (req, res, next) => {
    let errorRes;
    const { experienceRating, comment } = req.body;
    const { orderId } = req.params;
    const { venueId } = req.params;
    const { recipientId } = req.params;
    const venueRes = await venuesService.getById(venueId);
    const recipientRes = await recipientsService.getById(recipientId);
    const orderRes = await orderService.getById(orderId);
    if (!venueRes) {
      debug('Error Occured for Invalid Venue while fetching Rating data', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
    if (!recipientRes) {
      debug('Error Occured for Invalid Venue while fetching Rating data', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidRecipient);
      return next(errorRes);
    }
    if (!orderRes) {
      debug('Error Occured for Invalid Order while fetching rating data', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidOrder);
      return next(errorRes);
    }
    const ratingsParams = {
      experienceRating,
      orderId,
      recipientId,
      comment,
    };
    await ratingsService.save(ratingsParams);
    res.data = {
      status: true,
      message: Constant.labelList.insertSuccess,
    };
    next();
  },
  createCart: async (req, res, next) => {
    let errorRes;
    if (req.body.menuItems === undefined) {
      debug('Error Occured for missing fields in create cart', httpContext.get('requestId'));
      errorRes = createError(400, Constant.labelList.requiredField);
      return next(errorRes);
    }
    const venue = req.params.venueId;
    const vendor = req.params.vendorId;
    const menuItemList = req.body.menuItems;
    const transactionIdentifier = uuidv4();
    let cartId;
    let getCartRes;
    let clientSecret;
    let paymentIntentId;
    const venueRes = await venuesService.getById(venue);
    const vendorDetails = await vendorGeneralService.getById(vendor);
    if (venueRes) {
      const isMenuSameVendor = await isMenuOfSameVendor(menuItemList, vendor);
      if (isMenuSameVendor === true) {
        const venueDetails = venueRes;
        const subTotal = await ConsumersApi.calculatePaymentAmount(menuItemList);
        const amountDetails = await calculateTotalAmount(venueDetails, subTotal);
        // when cart is not created
        if (req.params.cartId === undefined) {
          const data = {
            transactionIdentifier,
            vendorId: vendor,
            vendorName: vendorDetails.name,
            menuItems: menuItemList,
            subTotal: parseFloat(subTotal),
            tax: venueDetails.tax,
            taxAmount: amountDetails.taxAmount,
            deliveryCharge: amountDetails.deliveryCharge,
            packingCharge: amountDetails.packingCharge,
            totalAmount: amountDetails.totalAmount,
            currency: venueDetails.currencySymbol,
          };
          req.body = data;
          const cartRes = await cartsService.save(req.body);
          // eslint-disable-next-line no-underscore-dangle
          cartId = cartRes._id;
          const paymentIntent = {
            amount: amountDetails.totalAmount,
            metadata: { cartId: cartId.toString() },
          };
          const createPaymentIntentRes = await stripeService.createPaymentIntent(paymentIntent);
          const updateParams = {
            Id: cartId,
            data: { paymentIntentId: createPaymentIntentRes.id },
            options: { runValidators: true },
          };
          await cartsService.update(updateParams);
          clientSecret = createPaymentIntentRes.client_secret;
          paymentIntentId = createPaymentIntentRes.id;
        } else {
          getCartRes = await cartsService.getById(req.params.cartId);
          if (!getCartRes) {
            debug('Error Occured for Invalid Cart in create cart', httpContext.get('requestId'));
            errorRes = createError(404, Constant.labelList.invalidCart);
            return next(errorRes);
          }
          const updateData = {
            // transactionIdentifier,
            vendorId: vendor,
            vendorName: vendorDetails.name,
            menuItems: menuItemList,
            subTotal: parseFloat(subTotal),
            tax: venueDetails.tax,
            taxAmount: amountDetails.taxAmount,
            deliveryCharge: amountDetails.deliveryCharge,
            packingCharge: amountDetails.packingCharge,
            totalAmount: amountDetails.totalAmount,
            currency: venueDetails.currencySymbol,
          };
          // eslint-disable-next-line no-underscore-dangle
          cartId = req.params.cartId;
          const updateParams = { Id: cartId, data: updateData, options: { runValidators: true } };
          await cartsService.update(updateParams);
          // Update paymentIntent
          const paymentIntent = {
            amount: amountDetails.totalAmount,
            paymentIntentId: getCartRes.paymentIntentId,
          };
          const updatePaymentIntentRes = await stripeService.updatePaymentIntent(paymentIntent);
          clientSecret = updatePaymentIntentRes.client_secret;
          paymentIntentId = updatePaymentIntentRes.id;
        }
        res.data = {
          status: true,
          cartId,
          clientSecret,
          paymentIntentId,
          message: Constant.labelList.insertSuccess,
        };
        next();
      } else {
        debug('Error Occured for Invalid Menu Items in create cart', httpContext.get('requestId'));
        errorRes = createError(422, Constant.labelList.InvalidMenuList);
        return next(errorRes);
      }
    } else {
      debug('Error Occured for Invalid Venue in create cart', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidVenue);
      return next(errorRes);
    }
  },
  updateCart: async (req, res, next) => {
    let errorRes;
    const query = {
      $and: [
        { phoneNumber: req.body.recipientPhoneNumber },
        { status: 'active' },
      ],
    };
    const isValidQuery = { query };
    const recipientRes = await recipientsService.getByCustomField(isValidQuery);
    if (recipientRes.length !== 0) {
      const delLocId = req.body.deliveryLocationId;
      const getDeliveryLocationDetails = await deliveryLocationsService.getById(delLocId);

      const updateData = {
        deliveryLocationId: req.body.deliveryLocationId,
        deliveryLocationName: getDeliveryLocationDetails.name,
        // eslint-disable-next-line no-underscore-dangle
        deliveryAreaId: getDeliveryLocationDetails.deliveryAreaId._id,
        deliveryAreaName: getDeliveryLocationDetails.deliveryAreaId.name,
        expectedDeliveryTime: req.body.expectedDeliveryTime,
        recipientName: req.body.recipientName,
        recipientPhoneNumber: req.body.recipientPhoneNumber,
        // eslint-disable-next-line no-underscore-dangle
        recipientId: recipientRes[0]._id,
      };
      const updateParams = { Id: req.params.cartId, data: updateData, options: { runValidators: true } };
      const cartRes = await cartsService.update(updateParams);
      if (cartRes !== null) {
        debug(`Cart Response in update cart ${JSON.stringify(cartRes)}`, httpContext.get('requestId'));
        res.data = await cartsExtendedService.getById(req.params.cartId);
        next();
      } else {
        debug('Error Occured for Invalid Cart in update cart', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidCart);
        return next(errorRes);
      }
    } else {
      debug('Error Occured for Invalid Recipient in update cart', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidRecipient);
      return next(errorRes);
    }
  },
  removeCart: async (req, res, next) => {
    let errorRes;
    const Id = req.params.cartId;
    res.data = await cartsService.delete(Id);
    if (res.data) {
      next();
    } else {
      debug('Error Occured for Invalid Cart in remove cart', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCart);
      return next(errorRes);
    }
  },
  validateCoupon: async (req, res, next) => {
    let errorRes;
    const cartsId = req.params.cartId;
    const coupon = req.body.couponCode;
    const recipientsId = req.params.recipientId;
    const venuesId = req.params.venueId;
    const couponDetails = await isCouponValid(coupon, venuesId, recipientsId);
    if (couponDetails === -1) {
      debug('Invalid Coupon in validate coupon', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCoupon);
      return next(errorRes);
    }
    if (couponDetails === 0) {
      debug('Coupon has reached maximum limit in validate coupon', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.maxLimitOfCoupon);
      return next(errorRes);
    }

    if (couponDetails.length !== 0) {
      const cartDetails = await cartsExtendedService.getById(cartsId);
      if (cartDetails !== null) {
        if (cartDetails.subTotal >= parseFloat(couponDetails[0].minimumOrderAmount)) {
          const offer = couponDetails[0].offerPercentage;
          let discountAmount = (parseFloat(offer) / 100) * cartDetails.subTotal;
          if (discountAmount > parseFloat(couponDetails[0].maximumLimit)) {
            discountAmount = parseFloat(couponDetails[0].maximumLimit);
          }
          const totalAmount = cartDetails.totalAmount - discountAmount;
          const updateData = {
            // eslint-disable-next-line no-underscore-dangle
            discountCodeId: couponDetails[0]._id,
            discount: offer,
            discountAmount,
            totalAmount,
          };
          const updateParams = { Id: cartsId, data: updateData, options: { runValidators: true } };
          await cartsService.update(updateParams);
          const paymentIntent = {
            amount: totalAmount,
            paymentIntentId: cartDetails.paymentIntentId,
          };
          await stripeService.updatePaymentIntent(paymentIntent);
          res.data = await cartsExtendedService.getById(req.params.cartId);
          next();
        } else {
          debug('Ordered Amount is not more than minimum order amount in validate coupon', httpContext.get('requestId'));
          errorRes = createError(404, Constant.labelList.minimumOrderAmount + couponDetails[0].minimumOrderAmount);
          return next(errorRes);
        }
      } else {
        debug('Invalid cart in validate coupon', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidCart);
        return next(errorRes);
      }
    } else {
      debug('Invalid coupon in validate coupon', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCoupon);
      return next(errorRes);
    }
  },
  removeCoupon: async (req, res, next) => {
    let errorRes;
    const cartDetails = await cartsService.getById(req.params.cartId);
    if (cartDetails !== null) {
      const totalAmt = (cartDetails.totalAmount + cartDetails.discountAmount).toFixed(2);
      const updateData = {
        discount: '0',
        discountAmount: 0,
        discountCodeId: null,
        totalAmount: parseFloat(totalAmt),
      };
      const updateParams = { Id: req.params.cartId, data: updateData, options: { runValidators: true } };
      await cartsService.update(updateParams);
      // Update paymentIntent
      const paymentIntent = {
        amount: parseFloat(totalAmt),
        paymentIntentId: cartDetails.paymentIntentId,
      };
      await stripeService.updatePaymentIntent(paymentIntent);
      res.data = await cartsExtendedService.getById(req.params.cartId);
      next();
    } else {
      debug('Invalid cart in remove coupon', httpContext.get('requestId'));
      errorRes = createError(404, Constant.labelList.invalidCart);
      return next(errorRes);
    }
  },
  calculatePaymentAmount: async (menuItemList) => {
    // const getCartRes = await cartsService.getById(cartId);
    let total = 0;
    for (const item of menuItemList) {
      const menuItemRes = await menuItemsGeneralService.getById(item.menuItemId);
      total += item.quantity * menuItemRes.price;
    }
    return total;
  },
  filterMenuItems: (menuItems) => menuItems.map((item) => ({
    menuItemId: item.menuItemId._id,
    quantity: item.quantity,
    deliverRestOfOrder: item.deliverRestOfOrder,
  })),
  paymentIntentSuccess: async (data) => {
    const orderCheck = {
      query: {
        paymentIntentId: data.id,
      },
    };
    const isOrderExists = await orderService.getByCustomField(orderCheck);
    if (isOrderExists.length > 0) {
      debug(`Duplicate order discard ${data.id}`, httpContext.get('requestId'));
      return;
    }
    const paymentMethod = 'card';
    const orderType = 'scheduled';
    const orderStatus = 'placed';
    const paymentStatus = 'success';
    let assignee;
    const { cartId } = data.metadata;
    const paymentIntentId = data.id;
    const colorCode = utilities.customRandomColorCode();
    const getCartRes = await cartsExtendedService.getById(cartId);
    const { venueId } = getCartRes.vendorId;
    const { deliveryAreaId } = getCartRes;
    const { venueName } = getCartRes;
    const menuItem = ConsumersApi.filterMenuItems(getCartRes.menuItems);
    const { vendorId } = getCartRes;
    const findAssigneeRes = assignee = await ConsumersApi.FindAssignee(getCartRes.expectedDeliveryTime, deliveryAreaId);
    assignee = findAssigneeRes.assignee;
    const { vendorName } = getCartRes;
    const manualOrderId = await orders.generateOrderId(getCartRes.deliveryAreaId);
    const order = {
      colorCode,
      orderId: manualOrderId,
      type: orderType,
      status: orderStatus,
      paymentMethod,
      paymentStatus,
      expectedDeliveryTime: new Date(getCartRes.expectedDeliveryTime).toJSON(),
      recipientName: getCartRes.recipientName,
      recipientPhoneNumber: getCartRes.recipientPhoneNumber,
      menuItem,
      vendorId,
      vendorName,
      assignee,
      venueId,
      venueName,
      recipientId: getCartRes.recipientId,
      tax: getCartRes.tax,
      taxAmount: getCartRes.taxAmount,
      deliveryLocationId: getCartRes.deliveryLocationId || getCartRes.vendorId.deliveryLocationId,
      deliveryLocationName: getCartRes.deliveryLocationName,
      deliveryAreaId: getCartRes.deliveryAreaId || getCartRes.vendorId.deliveryLocationId,
      deliveryAreaName: getCartRes.deliveryAreaName,
      deliveryCharge: getCartRes.deliveryCharge,
      packingCharge: getCartRes.packingCharge,
      subTotal: getCartRes.subTotal,
      totalAmount: getCartRes.totalAmount,
      discountCodeId: getCartRes.discountCodeId,
      discountCode: getCartRes.discountCode,
      discountAmount: getCartRes.discountAmount,
      paymentIntentId,
    };
    const orderSaveRes = await orderService.save(order);
    const transactionData = {
      recipientId: getCartRes.recipientId,
      orderId: orderSaveRes._id,
      paymentType: paymentMethod,
      status: paymentStatus,
      amount: getCartRes.totalAmount,
      paymentIntentId: getCartRes.paymentIntentId,
    };
    await transactionService.save(transactionData);
    for (const item of getCartRes.menuItems) {
      const items = {
        orderId: orderSaveRes._id,
        vendorId: item.menuItemId.vendorId._id,
        name: item.menuItemId.name,
        price: item.menuItemId.price * item.quantity,
        quantity: item.quantity,
        menuItemId: item.menuItemId._id,
        unitPrice: item.menuItemId.price,
        deliverRestOfOrder: item.deliverRestOfOrder,
      };
      await orderItemsService.save(items);
    }
    if (getCartRes.discountCodeId) {
      const discountCodeUsage = {
        recipientId: getCartRes.recipientId,
        discountCodeId: getCartRes.discountCodeId,
        orderId: orderSaveRes._id,
      };
      await consumerDiscountService.save(discountCodeUsage);
    }
    if (!findAssigneeRes.available) {
      const issueParams = {
        orderId: orderSaveRes._id,
        type: 'da-unavailable',
        reporter: assignee,
      };
      const issueCreateRes = await issuesService.save(issueParams);
    }
    // Remove cart
    cartsService.delete(cartId);
  },
  paymentIntentFailed: async (data) => {
    debug('Inform consumer in paymentIntent Failed', httpContext.get('requestId'));
    debug('revoke order');
    debug('report error');
  },
  webhook: async (req, res, next) => {
    debug(`webhook received ${JSON.stringify(req.body)}`, httpContext.get('requestId'));
    debug(`webhook req.headers ${JSON.stringify(req.headers)}`, httpContext.get('requestId'));
    const webhookRes = await stripeService.webhookHandling(req, res);
    next();
  },
  getOrderDeliveryTimeSlot: async (req, res, next) => {
    let errorRes;
    const cartsId = req.params.cartId;
    const venuesId = req.params.venueId;
    const vendorsId = req.query.vendorId;
    const IsVendorOpen = await isVendorOpen(vendorsId);
    if (IsVendorOpen !== false) {
      const cartDetails = await cartsService.getById(cartsId);
      if (cartDetails) {
        const deliveryTime = await calcDeliveryTime(cartDetails.menuItems);
        const timeSlotList = await getTimeSlotForOrder(deliveryTime);
        const finalTimeSlot = await isMenuItemAvail(cartDetails.menuItems, timeSlotList, deliveryTime);
        if (finalTimeSlot !== false) {
          res.data = { timeSlot: finalTimeSlot };
          next();
        } else {
          debug('Menu Item Not Available in delivery time slot', httpContext.get('requestId'));
          errorRes = createError(406, Constant.labelList.menuItemNotAvail);
          return next(errorRes);
        }
      } else {
        debug('Invalid cart in delivery time slot', httpContext.get('requestId'));
        errorRes = createError(404, Constant.labelList.invalidCart);
        return next(errorRes);
      }
    } else {
      debug('Vendor Not Available in delivery time slot', httpContext.get('requestId'));
      errorRes = createError(406, Constant.labelList.vendorNotAvail);
      return next(errorRes);
    }
  },
  FindAssignee: async (deliveryTime, deliveryAreaId) => {
    const response = {};
    const deliveryAgentList = [];
    const startSlot = Moment(deliveryTime);
    const endSlot = Moment(startSlot).add(config.api.timeSlotInterval, 'minutes');
    const orderFetch = {
      query: {
        expectedDeliveryTime: {
          $gte: startSlot,
          $lt: endSlot,
        },
        status: { $nin: ['cancelled', 'delivered'] },
      },
    };
    // Find Da with orders at given order time
    const orderRes = await orderService.getByCustomField(orderFetch);
    // All clocked in da
    // Find da based on orderArea they served last order
    // Find da based on minimum orders assigned the current day
    // Find da those are active at the time order
    const daListByArea = await availableDeliveryAgentsByArea(deliveryAreaId);
    let available = [];
    const availableInOrderArea = daListByArea.inOrderArea.filter((x) => !orderRes.find((o) => o.assignee.toString() === x.id.toString()));
    const availableOutOrderArea = daListByArea.outOrderArea.filter((x) => !orderRes.find((o) => o.assignee.toString() === x.id.toString()));
    if (availableInOrderArea.length > 0) {
      available = availableInOrderArea;
    } else {
      available = availableOutOrderArea;
    }
    if (available.length === 0) { // None of Da available assign to delivery Manager
      const userQuery = { query: { userRole: 'daManager' } };
      const getUserRes = await userService.getByCustomField(userQuery);
      response.assignee = getUserRes ? getUserRes[0]._id : null;
      response.available = false;
    } else {
      response.assignee = available[0].id;
      response.available = true;
      // Assign delivery agent to an Area dynamically
      const obj = {
        query: { userId: available[0].id },
        data: { deliveryAreaId },
      };
      deliveryAgentsService.updateCustomField(obj);
    }
    return response;
  },
  getOrderDetails: async (req, res, next) => {
    const orderRes = await orderConsumerService.getById(req.params.orderId);
    const query = { orderId: req.params.orderId };
    const object = { query };
    let finalOrderRes;
    const isuesData = await issuesService.getByCustomField(object);
    if (isuesData.length !== 0) {
      finalOrderRes = Object.assign(orderRes.toObject(), {
        issues: isuesData,
      });
    } else {
      finalOrderRes = orderRes;
    }
    res.data = { orderDetailsRes: finalOrderRes };
    next();
  },
};

module.exports = ConsumersApi;
