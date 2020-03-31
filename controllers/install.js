/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/order */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/install');
const ReferenceModelService = require('../services/referencedModelService');
const ModelService = require('../services/modelService');
const auth0 = require('../services/auth0');
const config = require('../config/config');

const venuesModel = require('../models/venues');
const Constant = require('../utilities/constant');
const user = require('../controllers/users');
const userRole = require('../controllers/userRoles');
const userController = require('../controllers/users');
const userModel = require('../models/users');
const userRolesModel = require('../models/userRoles');

const userRolesService = new ModelService(userRolesModel);

const usersService = new ReferenceModelService(userModel);
const references = Constant.reference.venue;
const venuesService = new ReferenceModelService(venuesModel, references);
// const currencyModel = require('../models/currencies');
const deliveryLocationModel = require('../models/deliveryLocations');
const deliveryAreaModel = require('../models/deliveryAreas');
const dropDownModel = require('../models/dropdowns');
const defaultTagsModel = require('../models/defaultTags');

// const currencyService = new ReferenceModelService(currencyModel);
const deliveryLocationService = new ReferenceModelService(deliveryLocationModel);
const deliveryAreaService = new ReferenceModelService(deliveryAreaModel);
const dropDownService = new ReferenceModelService(dropDownModel);
const defaultTagsService = new ReferenceModelService(defaultTagsModel);

const fs = require('fs');

const InstallApi = {

  install: async (req, res, next) => {
    // Create role super admin
    // create a super Admin in Auth0

    const { email } = req.body;
    const roleName = 'superAdmin';
    const filePath = './bin/install.json';
    const userExists = await usersService.totalCount();
    if (userExists > 0) {
      debug('User already exists in install', httpContext.get('requestId'));
      throw new Error('User already exists');
    }
    if (!email) {
      debug('Email id is compulsory', httpContext.get('requestId'));
      throw new Error(Constant.labelList.requiredField);
    }
    const installData = fs.readFileSync(filePath);
    const parsedData = JSON.parse(installData);
    if (!parsedData) {
      debug('JSON parse error in install', httpContext.get('requestId'));
      throw new Error(Constant.labelList.parseError);
    }
    const createVenueData = await venuesService.save(parsedData.venues);

    for (const item of parsedData.roles) {
      req.body = item;
      await userRole.saveUserRole(req, res, () => {
      });
    }
    req.body = { email, userRole: roleName, venueId: createVenueData.id };
    const saveUserRes = await user.saveUser(req, res, () => {
    });
    // const saveCurrencyRes = await currencyService.save(parsedData.currencies); // Save currencies
    if (res.data) {
      const response = { status: true };
      res.data = response;
      next();
    } else {
      debug('server error occured in install', httpContext.get('requestId'));
      throw new Error(Constant.labelList.serverError);
    }
  },
  installTerminals: async (req, res, next) => {
    const filePath = './bin/terminals.json';
    const venueExists = await venuesService.totalCount();
    if (venueExists === 0) {
      debug('No Terminal exists', httpContext.get('requestId'));
      throw new Error('No venue exists');
    }
    const venueData = await venuesService.getAll({});
    const installData = fs.readFileSync(filePath);
    const parsedData = JSON.parse(installData);
    if (!parsedData) {
      throw new Error(Constant.labelList.parseError);
    }
    for (const item of parsedData.deliveryAreas) {
      const deliveryAreaQuery = {
        query: { name: item.name },
        data: { name: item.name, venueId: venueData[0]._id, prefix: item.prefix },
      };
      const locationRes = await deliveryAreaService.getByCustomField(deliveryAreaQuery);
      let locationId;
      if (locationRes.length > 0) {
        const updateAreaRes = await deliveryAreaService.updateCustomField(deliveryAreaQuery);
        locationId = locationRes[0]._id;
      } else {
        const saveRes = await deliveryAreaService.save(deliveryAreaQuery.data);
        locationId = saveRes._id;
      }
      for (const gate of item.gates) {
        const deliveryLocationQuery = {
          query: { name: gate, venueId: venueData[0]._id, deliveryAreaId: locationId },
          data: { name: gate, venueId: venueData[0]._id, deliveryAreaId: locationId },
          options: { upsert: true },
        };
        const updateLocationRes = await deliveryLocationService.updateCustomField(deliveryLocationQuery);
      }
    }
    for (const dropDownItem of parsedData.dropDowns) {
      const dropDownQuery = {
        query: { type: dropDownItem.type, value: dropDownItem.value },
        data: dropDownItem,
      };
      const dropDownRes = await dropDownService.getByCustomField(dropDownQuery);
      if (dropDownRes.length > 0) {
        await dropDownService.updateCustomField(dropDownQuery);
      } else {
        await dropDownService.save(dropDownQuery.data);
      }
    }
    for (const tags of parsedData.defaultTags) { // install default tags
      const defaultTagQuery = {
        query: { name: tags.name },
        data: tags,
      };
      const defaultTagRes = await defaultTagsService.getByCustomField(defaultTagQuery);
      if (defaultTagRes.length > 0) {
        await defaultTagsService.updateCustomField(defaultTagQuery);
      } else {
        await defaultTagsService.save(defaultTagQuery.data);
      }
    }
    const response = { status: true, message: Constant.labelList.updateSuccess };
    res.data = response;
    next();
  },
  installUserRolePermissions: async (req, res, next) => {
    const filePath = './bin/install.json';
    const installData = fs.readFileSync(filePath);
    const parsedData = JSON.parse(installData);
    if (!parsedData) {
      throw new Error(Constant.labelList.parseError);
    }
    const superAdminPermissions = parsedData.roles.find((x) => x.name === 'superAdmin');
    req.superAdminPermissions = superAdminPermissions.permissions;
    debug('superAdminPermissions', superAdminPermissions.permissions);
    await userRole.addAuth0ApiPermission(req, res, () => {});// Add whole api permission in auth0 server
    for (const item of parsedData.roles) {
      req.body = item;
      await userRole.updateAuth0Permission(req, res, () => {
      });
    }
    const response = { status: true, message: Constant.labelList.updateSuccess };
    res.data = response;
    next();
  },
};
module.exports = InstallApi;
