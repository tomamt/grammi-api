/* eslint-disable no-console */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable prefer-const */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const moment = require('moment');
const ModelService = require('./modelService');
const vendorsModel = require('../models/vendors');
const vendorOperatingHours = require('../models/vendorOperatingHours');
const deliveryAreasModel = require('../models/deliveryAreas');
const deliveryLocationsModel = require('../models/deliveryLocations');

class ConsumerModelService extends ModelService {
  // eslint-disable-next-line no-useless-constructor
  constructor(model) {
    super(model);
  }

  // Get total count of records present
  async totalCount(obj) {
    const query = obj ? obj.query : {};
    const result = await this.Model.countDocuments(query);
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  async getVendorByVenueId(Id) {
    const data = vendorsModel.aggregate([
    // { $match: { venueId: mongoose.Types.ObjectId(Id) } },
      {
        $match: {
          $and: [
            { deliveryAreaId: mongoose.Types.ObjectId(Id) },
            { status: 'active' },
          ],
        },
      },
    ]);
    return data;
  }

  // List all records along with reference details
  async getAll(obj) {
    const query = obj ? obj.query : {};
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find(query).populate([
    /*  {
        path: 'currencyId',
        model: 'currencies',
      }, */
      {
        path: 'mediaId.square',
        model: 'medias',
      },
      {
        path: 'mediaId.rectangle',
        model: 'medias',
      },
      {
        path: 'vendorId',
        model: 'vendors',
        populate: [
          {
            path: 'venueId',
            model: 'venues',
          },
          {
            path: 'profilePicture',
            model: 'medias',
          },
          {
            path: 'mediaId',
            model: 'medias',
          },
        ],
      },
      {
        path: 'vendorTagId',
        model: 'vendorTags',
      },
    ]).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return resultObject;
  }

  // List all vendorMenuSection with menuItems details
  async getMenuItemByMenuSection(obj) {
    const query = obj ? obj.query : {};
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find(query).populate([
      {
        path: 'menuItems.menuItemId',
        model: 'menuItems',
        populate: [
          /* {
            path: 'currencyId',
            model: 'currencies',
          }, */
          {
            path: 'mediaId.square',
            model: 'medias',
          },
          {
            path: 'mediaId.rectangle',
            model: 'medias',
          },
          {
            path: 'vendorId',
            model: 'vendors',
            populate: [
              {
                path: 'venueId',
                model: 'venues',
              },
              {
                path: 'profilePicture',
                model: 'medias',
              },
              {
                path: 'mediaId',
                model: 'medias',
              },
            ],
          },
        ],
      },
    ]).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return resultObject;
  }

  // eslint-disable-next-line class-methods-use-this
  async getVendorByAvalibility(Id) {
    const d = new Date();
    const time = `${d.getHours()}.${d.getMinutes()}`;
    const timeNumber = parseFloat(time);
    // //console.log('timeNumber', timeNumber);
    // //console.log('Id', Id);
    const data = vendorOperatingHours.find({
      $and: [
        { opening: { $lt: timeNumber } },
        { closing: { $gt: timeNumber } },
        { vendorId: Id },
      ],
    });
    return data;
  }

  // Validate all menuItem of same vendor
  // eslint-disable-next-line class-methods-use-this
  async IsMenuOfSameVendor(menuItemId, VendorId) {
    const data = this.Model.find({
      $and: [
        { _id: menuItemId },
        { vendorId: VendorId },
      ],
    });
    return data;
  }

  async getMenuItemIds(menuItemId) {
    const data = this.Model.find({
      $and: [
        { _id: menuItemId },
      ],
    });
    return data;
  }

  async deliveryAgentAvailable(Id) {
    const data = this.Model.find({
      $and: [
        { clockIn: { $lte: new Date() } },
        { venueId: Id },
        { clockOut: null },
      ],
    });
    return data;
  }

  // All clocked in da
  // Find da based on orderArea they served last order
  // Find da based on minimum orders assigned the current day
  async deliveryAgentAvailableByArea(Id, day) {
    let start = day ? day : moment().startOf('day'); // set to 12:00 am today
    const data = this.Model.aggregate([
      {
        $match: {
          $and: [
            { clockIn: { $lte: new Date() } },
            { clockOut: null },
          ],
        },
      },
      {
        $lookup: {
          from: 'deliveryagents',
          localField: 'userId',
          foreignField: 'userId',
          as: 'dalist',
        },
      },
      {
        $unwind: '$dalist',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: '$users',
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'userId',
          foreignField: 'assignee',
          as: 'orders',
        },
      },
      {
        $project: {
          users: true,
          dalist: true,
          orders: {
            $filter: {
              input: '$orders',
              as: 'orders',
              cond: { $gte: ['$$orders.createdDate', new Date(start)] },
            },
          },
        },
      },

    ]).allowDiskUse(true);
    return data;
  }

  async IsOpen(query) {
    const data = this.Model.find(query);
    return data;
  }

  async IsActive(query) {
    const data = this.Model.find(query);
    return data;
  }

  async getDeliveryArea() {
    const data = this.Model.aggregate([
      {
        $lookup: {
          from: 'deliverylocations',
          localField: '_id',
          foreignField: 'deliveryAreaId',
          as: 'deliveryLocations',
        },
      },
    ]);
    return data;
  }
}
module.exports = ConsumerModelService;
