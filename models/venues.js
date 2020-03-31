const mongoose = require('mongoose');
const DeliveryLocations = require('../models/deliveryLocations');
const Issues = require('../models/issues');
const DiscountCodes = require('../models/discountCodes');
const Notifications = require('../models/notifications');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = async function (next) {
  // eslint-disable-next-line no-underscore-dangle
  const id = this._id;
  const isDeliveryLocationsExist = await DeliveryLocations.findOne({ venueId: id }).exec();
  const isIssuesExist = await Issues.findOne({ venueId: id }).exec();
  const isDiscountCodesExist = await DiscountCodes.findOne({ venueId: id }).exec();
  const isNotificationsExist = await Notifications.findOne({ venueId: id }).exec();

  if (isDeliveryLocationsExist) {
    DeliveryLocations.remove({ venueId: id }).exec();
  }
  if (isIssuesExist) {
    Issues.remove({ venueId: id }).exec();
  }
  if (isDiscountCodesExist) {
    DiscountCodes.remove({ venueId: id }).exec();
  }
  if (isNotificationsExist) {
    Notifications.remove({ venueId: id }).exec();
  }
  next();
};
const venueModel = () => {
  const venuesSchema = new mongoose.Schema({
    type: { type: String, required: [true, "can't be blank"] },
    name: { type: String, required: true },
    address: { type: String, required: true },
    mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    currency: { type: String, required: true },
    currencySymbol: { type: String, required: true },
    tax: { type: String, required: true },
    packingCharge: { type: String, required: true },
    deliveryCharge: { type: String, required: true },
    extraField: {
      fieldName: { type: String, required: false },
      value: { type: Number, required: false },
      valueType: { type: String, required: false },
    },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  venuesSchema.pre('remove', removeDependecy);
  return mongoose.model('venues', venuesSchema);
};

module.exports = venueModel();
