/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const ModelService = require('../services/referencedModelService');
const menuItemModel = require('../models/menuItems');
const config = require('../config/config');

class OrderModelService extends ModelService {
  constructor(model) {
    super(model);
    this.model = model;
  }

  // Get particular record along with reference  details based on delivery agent
  async getById(Id) {
    const resultObject = this.Model.findById({ _id: Id }).populate([
    /*  {
        path: 'currency',
        model: 'currencies',
      }, */
      {
        path: 'vendorId',
        model: 'vendors',
        populate: [{
          path: 'venueId',
          model: 'venues',
        },
        {
          path: 'deliveryAreaId',
          model: 'deliveryareas',
        },
        {
          path: 'deliveryLocationId',
          model: 'deliverylocations',
        }],
      },
      {
        path: 'deliveryLocationId',
        model: 'deliverylocations',
      },
      {
        path: 'menuItem.menuItemId',
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
            populate: [{
              path: 'venueId',
              model: 'venues',
            },
            {
              path: 'deliveryAreaId',
              model: 'deliveryareas',
            },
            {
              path: 'deliveryLocationId',
              model: 'deliverylocations',
            }],
          },
          {
            path: 'vendorTagId',
            model: 'vendorTags',
          },
        ],
      },
      {
        path: 'assignee',
        model: 'users',
      },
    ]);
    return resultObject;
  }

  // List all records along with reference details
  async getAll(obj) {
    const query = obj ? obj.query : {};
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find(query).populate([
      {
        path: 'vendorId',
        model: 'vendors',
        populate: {
          path: 'venueId',
          model: 'venues',
        },
      },
      {
        path: 'menuItem.menuItemId',
        model: 'menuItems',
        populate: [
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
            populate: {
              path: 'venueId',
              model: 'venues',
            },
          },
          {
            path: 'vendorTagId',
            model: 'vendorTags',
          },
        ],
      },
      {
        path: 'deliveryLocationId',
        model: 'deliverylocations',
      },
      {
        path: 'assignee',
        model: 'users',
      },
      {
        path: 'discountCodeId',
        model: 'discountCodes',
      },
    ]).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return resultObject;
  }

  async getOrderForDeliveryAgent(obj) {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const query = obj ? obj.query : {};
    const resultObject = this.Model.find(query).populate([
      {
        path: 'vendorId',
        model: 'vendors',
        populate: [
          {
            path: 'venueId',
            model: 'venues',
          },
          {
            path: 'deliveryAreaId',
            model: 'deliveryareas',
          },
          {
            path: 'deliveryLocationId',
            model: 'deliverylocations',
          },
        ],
      },
      {
        path: 'menuItem.menuItemId',
        model: 'menuItems',
        populate: [
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
                path: 'deliveryAreaId',
                model: 'deliveryareas',
              },
              {
                path: 'deliveryLocationId',
                model: 'deliverylocations',
              },
            ],
          },
          {
            path: 'vendorTagId',
            model: 'vendorTags',
          },
        ],
      },
      {
        path: 'deliveryLocationId',
        model: 'deliverylocations',
      },
      {
        path: 'assignee',
        model: 'users',
      },
      {
        path: 'discountCodeId',
        model: 'discountCodes',
      },
    ]).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return resultObject;
  }

  async totalCountForDeliveryAgent(obj) {
    const query = obj ? obj.query : {};
    const result = await this.Model.countDocuments(query);
    return result;
  }


  async getOrderForCrew(Id, start, end) {
    const data = this.model.aggregate([
      {
        $match: {
          $and: [
            { expectedDeliveryTime: { $gte: new Date() } },
            { vendorId: mongoose.Types.ObjectId(Id) },
            { status: { $in: ['placed', 'fired', 'da-unavailable'] } },
          ],
        },
      },
      { $unwind: '$menuItem' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'menuItem.menuItemId',
          foreignField: '_id',
          as: 'menuItemsArray',
        },
      },
      { $unwind: '$menuItemsArray' },
      {
        $group: {
          _id: '$_id',
          orderId: { $first: '$orderId' },
          expectedDeliveryTime: { $first: '$expectedDeliveryTime' },
          colorCode: { $first: '$colorCode' },
          status: { $first: '$status' },
          recipientName: { $first: '$recipientName' },
          recipientPhoneNumber: { $first: '$recipientPhoneNumber' },
          menuItems: {
            $push: {
              menuItemId: '$menuItemsArray',
              deliverRestOfOrder: '$menuItem.deliverRestOfOrder',
              quantity: '$menuItem.quantity',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$expectedDeliveryTime',
          orders: { $push: '$$ROOT' },
          menuCount: { $sum: '$count' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    // const res = await menuItemModel.populate(data, { path: 'orders.menuItem' });
    return data;
  }

  async getUpcomingOrderForCrew(Id, start, end) {
    const data = this.model.aggregate([
      {
        $match: {
          $and: [
            { expectedDeliveryTime: { $gte: new Date(start), $lt: new Date(end) } },
            { vendorId: mongoose.Types.ObjectId(Id) },
            { status: { $in: ['placed', 'fired', 'da-unavailable'] } },
          ],
        },
      },
      { $unwind: '$menuItem' },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'menuItem.menuItemId',
          foreignField: '_id',
          as: 'menuItemsArray',
        },
      },
      { $unwind: '$menuItemsArray' },
      {
        $group: {
          _id: '$_id',
          orderId: { $first: '$orderId' },
          expectedDeliveryTime: { $first: '$expectedDeliveryTime' },
          colorCode: { $first: '$colorCode' },
          status: { $first: '$status' },
          recipientName: { $first: '$recipientName' },
          recipientPhoneNumber: { $first: '$recipientPhoneNumber' },
          menuItems: {
            $push: {
              menuItemId: '$menuItemsArray',
              deliverRestOfOrder: '$menuItem.deliverRestOfOrder',
              quantity: '$menuItem.quantity',
            },
          },
          count: { $sum: 1 },
        },
      },
      // {
      //   $group: {
      //     _id: '$expectedDeliveryTime',
      //     orders: { $push: '$$ROOT' },
      //     menuCount: { $sum: '$count' },
      //     count: { $sum: 1 },
      //   },
      // },
      {
        $sort: { _id: 1 },
      },
    ]);
    // const res = await menuItemModel.populate(data, { path: 'orders.menuItem' });
    return data;
  }

  async getLastOrderByDeliveryAgent(obj) {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const query = obj ? obj.query : {};
    const resultObject = this.Model.find(query).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return resultObject;
  }
}
module.exports = OrderModelService;
