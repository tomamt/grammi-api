const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:controllers/invitations');
const ModelService = require('../services/modelService');
const invitationsModel = require('../models/invitations');
const utilities = require('../utilities/utilities');

const invitationsService = new ModelService(invitationsModel);
const invitationsApi = {
  saveInvitation: async (req, res, next) => {
    try {
      const utilitiesRes = utilities.addMoment(new Date(), 2, 'months');
      debug(`utilitiesRes ${utilitiesRes}`);
      req.body.expiry = utilitiesRes.dateTime;
      res.data = await invitationsService.save(req.body);
    } catch (error) {
      debug(`error in save Invitation ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getInvitation: async (req, res, next) => {
    try {
      res.data = await invitationsService.getById(req.params.invitationId);
    } catch (error) {
      debug(`error in getting Invitation ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updateInvitation: async (req, res, next) => {
    try {
      const obj = { Id: req.params.invitationId, data: req.body, options: { runValidators: true } };
      res.data = await invitationsService.update(obj);
    } catch (error) {
      debug(`error in updating Invitation ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  updatePartialInvitation: async (req, res, next) => {
    try {
      const obj = { Id: req.params.invitationId, data: req.body, options: { runValidators: true } };
      res.data = await invitationsService.update(obj);
    } catch (error) {
      debug(`error in updating Invitation ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  deleteInvitation: async (req, res, next) => {
    try {
      res.data = await invitationsService.deleteRemove(req.params.invitationId);
    } catch (error) {
      debug(`error in deleteting Invitation ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
  getAllInvitation: async (req, res, next) => {
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
      const totalCountRes = await invitationsService.totalCount();
      const invitationRes = await invitationsService.getAll(obj);
      if (invitationRes) {
        const response = { status: true, totalCount: totalCountRes, message: invitationRes };
        res.data = response;
      }
    } catch (error) {
      debug(`error in listing Invitation ${error}`, httpContext.get('requestId'));
      res.error = error;
    }
    next();
  },
};
module.exports = invitationsApi;
