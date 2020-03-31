/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable quotes */
/* eslint-disable no-use-before-define */
/* eslint-disable eqeqeq */
/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/users');
const createError = require('http-errors');
const moment = require('moment');
const ModelService = require('../services/modelService');
const socket = require('../controllers/socket');
const userModel = require('../models/users');
const venueModel = require('../models/venues');
const userRoleModel = require('../models/userRoles');
const vendorModel = require('../models/vendors');
const deliveryAgentModel = require('../models/deliveryAgents');
const ordersModel = require('../models/orders');
const Constant = require('../utilities/constant');
const OrdersService = require('../services/orders');

const ordersService = new OrdersService(ordersModel, []);
const vendorService = new ModelService(vendorModel);
const deliveryAgentService = new ModelService(deliveryAgentModel);
const venueService = new ModelService(venueModel);
const usersService = new ModelService(userModel);
const userRoleService = new ModelService(userRoleModel);
const orderService = new ModelService(ordersModel);
const auth0 = require('../services/auth0');
// const constant = require('../utilities/constant');
const utilities = require('../utilities/utilities');

const updateFunction = async (id, req, res) => {
  const obj = { Id: id, data: req, options: { runValidators: true } };
  const name = req.name;
  if (req.status || req.name) {
    // Run a job to lock user in auth0
    await usersApi.changeAuth0UserStatus(req.status, id, name);
  }
  const data = await usersService.update(obj);
  return data;
};

const usersApi = {
  saveUser: async (req, res, next) => {
    let generateTokenRes;
    try {
      const randomKeyOptions = {
        length: 10,
        numbers: true,
        uppercase: true,
        symbols: true,
        lowercase: true,
        strict: true,
      };
      const userRoles = {
        query: { name: req.body.userRole },
      };
      const roleID = await userRoleService.getByCustomField(userRoles);
      if (!roleID) {
        throw new Error('Not found Auth0 RoleId');
      }
      const venue = await venueService.getById(req.body.venueId);
      if (!venue) {
        throw new Error('Invalid VenueId');
      }
      generateTokenRes = await auth0.generateToken(req.body);
      const generatePasswordRes = utilities.createRandomKey(randomKeyOptions);
      req.body.randomPassword = generatePasswordRes;
      req.body.user_metadata = { userRole: req.body.userRole };
      const createUserRes = await auth0.createUser(req.body, generateTokenRes);
      req.body.auth0Id = createUserRes.user_id;
      req.body.auth0RoleId = roleID[0].auth0RoleId;
      debug(`auth0 created response ${createUserRes}`, httpContext.get('requestId'));
      const assignRolestoUserRes = await auth0.assignRolestoUser(req.body, generateTokenRes);
      // debug(`auth0 createPermissionRes response ${assignRolestoUserRes}`);
      // const verificationTicket = await auth0.createEmailVerificationTicket(req.body, generateTokenRes);
      const EmailRes = await auth0.requestChangePasswordEmail(req.body, generateTokenRes);
      res.data = await usersService.save(req.body);
      const dependencyParams = {
        venueId: req.body.venueId,
        email: req.body.email,
        name: req.body.name,
        userId: res.data._id,
        vendorId: req.vendorId,
        userRole: req.body.userRole,
      };
      usersApi.updateRoleDependencies(dependencyParams);
      req.body.userId = res.data._id;
      req.body.data = { user_metadata: { userId: res.data._id, vendorId: req.vendorId } };
      const updateUserRes = await auth0.updateUser(req.body, generateTokenRes);
      debug(`user updateUserRes response ${updateUserRes}`, httpContext.get('requestId'));
      if (res.data) {
        next();
      }
    } catch (e) {
      debug(`error in save revoke users ${e.message}, ${e.statusCode}`, httpContext.get('requestId'));
      // 409 - User already exists in auth0
      if (e.statusCode !== 409) {
        debug('existing user remove from db', e.message, e.statusCode);
        await auth0.deleteUser(req.body, generateTokenRes);
        await usersService.deleteRemove(req.body.userId);
        throw new Error(e.message);
      } else {
        const errorRes = createError(e.statusCode, e.message);
        throw new Error(errorRes);
      }
    }
  },
  getUser: async (req, res, next) => {
    const user = {};
    const userRes = await usersService.getById(req.params.userId);
    const userRoles = {
      query: { name: userRes.userRole },
    };
    const userRoleRes = await userRoleService.getByCustomField(userRoles);
    user.users = userRes;
    user.userRoles = userRoleRes[0];
    if (userRes) {
      const response = { status: true, users: user };
      res.data = response;
      next();
    } else {
      debug('Error while listing particular user', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateUser: async (req, res, next) => {
    const obj = { Id: req.params.userId, data: req.body, options: { runValidators: true } };
    res.data = await usersService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('Error while updating user', httpContext.get('requestId'));
      throw new Error();
    }
  },
  // eslint-disable-next-line consistent-return
  updatePartialUser: async (req, res, next) => {
    const userRes = await usersService.getById(req.params.userId);
    if (userRes.userRole == 'deliveryAgent' && req.body.status == 'locked') {
      const endDate = moment().format('YYYY-MM-DD HH:mm');
      const startDate = moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm');
      const objCount = {
        query: {
          assignee: utilities.CreateObjectId(req.params.userId),
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
      if (ordersRes.length == 0) {
        const dataObj = {
          id: req.params.userId,
          status: req.body.status,
        };
        await socket.forceClockOutStatus(dataObj);
        const data = await updateFunction(req.params.userId, req.body);
        res.data = data;
        if (res.data) {
          next();
        } else {
          throw new Error();
        }
      } else {
        debug('Da still have orders to complete in users', httpContext.get('requestId'));
        errorRes = createError(200, Constant.labelList.deliveryAgentHasOrders);
        return next(errorRes);
      }
    } else if (userRes.userRole == 'crew' && req.body.status == 'locked') {
      const dataObj = {
        id: req.params.userId,
        status: req.body.status,
      };
      await socket.forceClockOutStatus(dataObj);
      const data = await updateFunction(req.params.userId, req.body);
      res.data = data;
      if (res.data) {
        next();
      } else {
        throw new Error();
      }
    } else {
      const data = await updateFunction(req.params.userId, req.body);
      res.data = data;
      if (res.data) {
        next();
      } else {
        throw new Error();
      }
    }
  },
  deleteUser: async (req, res, next) => {
    const userData = await usersService.getById(req.params.userId);
    res.data = await usersService.deleteRemove(req.params.userId);
    const generateTokenRes = await auth0.generateToken(req.body);
    const deleteAuth0UserRes = await auth0.deleteUser(userData, generateTokenRes);
    if (res.data) {
      next();
    } else {
      debug('Error while deleting user', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllUser: async (req, res, next) => {
    if (req.query.sortValue === undefined || req.query.sortColumn === undefined) {
      req.query.sortValue = '-1';
      req.query.sortColumn = 'createdDate';
    }
    let query;
    if (!req.query.vendorId) {
      if (req.query.filterColumn && req.query.filterValue) {
        query = { [req.query.filterColumn]: [req.query.filterValue] };
      }
    } else {
      const crew = [];
      if (req.query.filterColumn && req.query.filterValue) {
        const crewMembersRes = await vendorService.getById(req.query.vendorId);
        query = { $and: [{ [req.query.filterColumn]: [req.query.filterValue] }, { _id: { $in: crewMembersRes.crewIds } }] };
      }
    }
    const obj = {
      pageSize: req.query.pageSize,
      pageNo: req.query.pageNo,
      sortValue: req.query.sortValue,
      sortColumn: req.query.sortColumn,
      query,
    };

    let userRes;
    let userRes1;
    let totalCountRes;
    const seen = new Set();
    if (req.query.filterValue === 'deliveryAgent' && req.query.list !== 'all') {
      // let startDate;
      // let endDate;
      // if (req.body.timezone) {
      //   endDate = moment().tz(req.body.timezone).format('YYYY-MM-DD HH:mm');
      //   startDate = moment().tz(req.body.timezone).subtract(12, 'hours').format('YYYY-MM-DD HH:mm');
      // } else {
      //   endDate = moment().format('YYYY-MM-DD HH:mm');
      //   startDate = moment().subtract(12, 'hours').format('YYYY-MM-DD HH:mm');
      // }
      userRes = await orderService.getMinimumOrderDaList(req.query.id);
      userRes1 = await usersService.getDaList(req.query.id);
      userRes1 = userRes1.filter((el1) => el1.clockOut === null);
      userRes = userRes.concat(userRes1);
      userRes = userRes.filter((el) => {
        const duplicate = seen.has(el._id.toString());
        seen.add(el._id.toString());
        return !duplicate;
      });
      totalCountRes = userRes.length;
    } else {
      totalCountRes = await usersService.totalCount(obj);
      userRes = await usersService.getAll(obj);
    }
    if (userRes) {
      const response = { status: true, totalCount: totalCountRes, users: userRes };
      res.data = response;
      next();
    } else {
      debug('Error while listing all users', httpContext.get('requestId'));
      throw new Error();
    }
  },
  changeAuth0UserStatus: async (status, userId, name) => {
    let userStatus;
    const updateData = {};
    updateData.data = {};
    if (status) {
      if (status === 'active') {
        userStatus = false;
      } else if (status === 'locked') {
        userStatus = true;
      } else {
        throw new Error('Invalid status');
      }
      updateData.data = { blocked: userStatus };
    }
    const generateTokenRes = await auth0.generateToken({});
    const userRes = await usersService.getById(userId);
    updateData.auth0Id = userRes.auth0Id;
    if (name) {
      updateData.data.name = name;
    }
    const updateUserRes = await auth0.updateUser(updateData, generateTokenRes);
    return updateUserRes;
  },
  updateRoleDependencies: async (data) => { // Update dependencies based on user role
    if (data.userRole === 'vendor') { // add vendor details to vendor table
      const vendorParams = {
        venueId: data.venueId,
        email: data.email,
        name: data.name,
        userId: data.userId,
      };
      await vendorService.save(vendorParams);
    }
    if (data.userRole === 'crew') { // add crew details to vendor table
      const vendorCrew = {
        query: { _id: data.vendorId },
        data: { $push: { crewIds: data.userId } },
      };
      await vendorService.updateArrayField(vendorCrew);
    }
    if (data.userRole === 'deliveryAgent') { // add deliveryAgentId details to deliveryAgent table
      const daParams = {
        venueId: data.venueId,
        userId: data.userId,
      };
      await deliveryAgentService.save(daParams);
    }
  },
};
module.exports = usersApi;
