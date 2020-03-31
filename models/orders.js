/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const express = require('express');
// eslint-disable-next-line no-unused-vars
const validation = require('../middleware/customValidations');
const deliveryAreaModel = require('../models/deliveryAreas');
const socket = require('../controllers/socket');

const router = express.Router();

const updateDependecy = async function (next) {
  // eslint-disable-next-line no-underscore-dangle
  // console.log(this._update['$set']);
  // do orderHistory update here
  const obj = {};
  if (this._conditions._id) {
    const socketIdRes = await this.model.findById({ _id: this._conditions._id }).populate([
      /* {
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
          path: 'crewIds',
          match: {
            status: 'active',
          },
          model: 'users',
        },
        ],
      },
      {
        path: 'deliveryLocationId',
        model: 'deliverylocations',
        // populate: [{
        //   path: 'venueId',
        //   model: 'venues',
        // },
        // {
        //   path: 'deliveryAreaId',
        //   model: 'deliveryareas'
        // }]
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
        path: 'assignee',
        model: 'users',
      },
    ]);
    obj.res = socketIdRes;
  }
  if (this._update.$set.recipientId && this._update.$set.status) {
    obj.status = 'consumer-issue';
  } else if (this._update.$set.status) {
    obj.status = this._update.$set.status;
  }
  if (this._update.$set.assignee) {
    obj.res.assignee = this._update.$set.assignee;
    obj.status = 'reassign';
  }
  const socketRes = await socket.updateOrderStatus(obj);
  // next();
};

const saveDependecy = async function (next) {
  const count = await this.constructor.count({});
  await deliveryAreaModel.updateOne(
    { _id: this.deliveryAreaId },
    { $set: { lastOrderId: count } },
  );
  const socketRes = await socket.saveOrderStatus(this);
  // next();
};

const ordersModel = () => {
  const Orders = new mongoose.Schema({
    orderId: { type: String, required: false },
    colorCode: { type: String, required: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ['placed', 'fired', 'ready', 'pickedup', 'arrived', 'delivered', 'crew-issue', 'da-issue', 'cancelled'],
      /*     enum: ['placed', 'confirmed', 'processing', 'ready', 'pickedup', 'inroute', 'arrived', 'delivered', 'issue',
     'cancelled'], */
      required: true,
    },
    expectedDeliveryTime: { type: Date, required: true },
    // scheduledTime: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientPhoneNumber: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients', required: true },
    menuItem: [{
      menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItems', required: true },
      quantity: { type: Number },
      deliverRestOfOrder: { type: Boolean },
    }],
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
    vendorName: { type: String, required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    assignedDate: { type: Date },
    firedDate: { type: Date },
    readyDate: { type: Date },
    pickedupDate: { type: Date },
    arrivedDate: { type: Date },
    deliveredDate: { type: Date },
    cancelledDate: { type: Date },
    cookingTime: { type: String }, // Diff fired - ready
    deliveryTime: { type: String }, // Diff pickedup - delivered
    orderCompletionTime: { type: String }, // Diff placed - delivered
    deliveryLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliverylocations', required: true },
    deliveryLocationName: { type: String, required: true },
    deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas', required: true },
    deliveryAreaName: { type: String, required: true },
    discount: { type: String, required: false },
    discountAmount: { type: Number, required: false },
    tax: { type: String, required: false },
    taxAmount: { type: Number, required: false },
    deliveryCharge: { type: String, required: true },
    packingCharge: { type: String, required: true },
    discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'discountCodes', required: false },
    discountCode: { type: String, required: false },
    subTotal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    // transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'transactions', required: false },
    transactionIdentifier: { type: String, required: false },
    paymentMethod: { type: String, required: false },
    paymentStatus: {
      type: String,
      enum: ['success', 'failed', 'processing'],
      required: true,
    },
    paymentIntentId: { type: String, required: true, unique: true },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  Orders.pre('updateOne', updateDependecy);
  Orders.post('save', saveDependecy);
  return mongoose.model('orders', Orders);
};
module.exports = ordersModel();
// module.exports = mongoose.model('orders', Orders);
