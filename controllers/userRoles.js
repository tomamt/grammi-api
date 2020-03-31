/* eslint-disable no-unused-vars */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/userRoles');
const ModelService = require('../services/modelService');
const auth0 = require('../services/auth0');
const userRolesModel = require('../models/userRoles');
const config = require('../config/config');

const userRolesService = new ModelService(userRolesModel);
const userRolesApi = {
  saveUserRole: async (req, res, next) => {
    const generateTokenRes = await auth0.generateToken(req.body);
    const createRoleRes = await auth0.createRole(req.body, generateTokenRes);
    req.body.auth0RoleId = createRoleRes.id;
    req.body.resourceServerId = config.api.resourceServerId;
    req.body.resourceServerIdentifier = config.api.resourceServerIdentifier;
    const rolePermissionRes = userRolesApi.alterPermissionObject(req.body.permissions);
    req.body.rolePermission = rolePermissionRes;
    await auth0.updateResourceServer(req.body, generateTokenRes);
    await auth0.addPermissionsInRole(req.body, generateTokenRes);
    res.data = await userRolesService.save(req.body);
    if (res.data) {
      next();
    } else {
      debug('error in save userRole', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getUserRole: async (req, res, next) => {
    const userRoleRes = await userRolesService.getById(req.params.userRoleId);
    if (userRoleRes) {
      const response = { status: true, userRoles: userRoleRes };
      res.data = response;
      next();
    } else {
      debug('error in listing particular userRole', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updateUserRole: async (req, res, next) => {
    const obj = { Id: req.params.userRoleId, data: req.body, options: { runValidators: true } };
    res.data = await userRolesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('error in update userRole', httpContext.get('requestId'));
      throw new Error();
    }
  },
  updatePartialUserRole: async (req, res, next) => {
    const obj = { Id: req.params.userRoleId, data: req.body, options: { runValidators: true } };
    res.data = await userRolesService.update(obj);
    if (res.data) {
      next();
    } else {
      debug('error in updating partial userRole', httpContext.get('requestId'));
      throw new Error();
    }
  },
  deleteUserRole: async (req, res, next) => {
    res.data = await userRolesService.deleteRemove(req.params.userRoleId);
    if (res.data) {
      next();
    } else {
      debug('error in delete userRole', httpContext.get('requestId'));
      throw new Error();
    }
  },
  getAllUserRole: async (req, res, next) => {
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
    const totalCountRes = await userRolesService.totalCount(obj);
    const userRoleRes = await userRolesService.getAll(obj);
    if (userRoleRes) {
      const response = { status: true, totalCount: totalCountRes, userRoles: userRoleRes };
      res.data = response;
      next();
    } else {
      debug('error in listing all userRole', httpContext.get('requestId'));
      throw new Error();
    }
  },
  alterPermissionObject: (data) => {
    const outPutRes = data.map((item) => ({
      permission_name: item.value,
      resource_server_identifier: config.api.resourceServerId,
    }));
    return outPutRes;
  },
  addAuth0ApiPermission: async (req, res, next) => { // Add permission to auth0 api server
    const resourceServerData = {
      resourceServerIdentifier: config.api.resourceServerIdentifier,
      permissions: req.superAdminPermissions,
    };
    const generateTokenRes = await auth0.generateToken(req.body);
    await auth0.updateResourceServer(resourceServerData, generateTokenRes);
    debug('addAuth0ApiPermission');
    next();
  },
  updateAuth0Permission: async (req, res, next) => { // Add permission to auth0 user role
    const userQuery = { query: { name: req.body.name } };
    const userRoleRes = await userRolesService.getByCustomField(userQuery);
    const generateTokenRes = await auth0.generateToken(req.body);
    req.body.resourceServerId = config.api.resourceServerId;
    const rolePermissionRes = userRolesApi.alterPermissionObject(req.body.permissions);
    req.body.rolePermission = rolePermissionRes;
    const rolePermissions = {
      auth0RoleId: userRoleRes[0].auth0RoleId,
      rolePermission: rolePermissionRes,
    };
    req.body.resourceServerIdentifier = config.api.resourceServerIdentifier;
    await auth0.addPermissionsInRole(rolePermissions, generateTokenRes);
    next();
  },
};
module.exports = userRolesApi;
