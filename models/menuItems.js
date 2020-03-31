const mongoose = require('mongoose');
const vendorMenuSection = require('../models/vendorMenuSections');
// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = async function (next) {
  // eslint-disable-next-line global-require
  const menuItemAvailableHours = require('../models/menuItemAvailableHours');
  // eslint-disable-next-line no-underscore-dangle
  const id = this._id;
  const ismenuItemAvailableHours = await menuItemAvailableHours.findOne({ menuItemId: id }).exec();
  if (ismenuItemAvailableHours) {
    menuItemAvailableHours.remove({ menuItemId: id }).exec();
  }
  const isVendorMenuSectionAvail = await vendorMenuSection.find({ 'menuItems.menuItemId': id });
  if (isVendorMenuSectionAvail.length !== 0) {
    await Promise.all(isVendorMenuSectionAvail.map(async (element) => {
      await vendorMenuSection.update(
        // eslint-disable-next-line no-underscore-dangle
        { _id: element._id },
        { $pull: { menuItems: { menuItemId: id } } }, { upsert: true },
      );
    }));
  }
  next();
};

const menuItemsModel = () => {
  const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    preparationTime: { type: Number, required: true },
    // currencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'currencies', required: false },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
    mediaId: {
      square: { type: mongoose.Schema.Types.ObjectId, ref: 'medias', required: false },
      rectangle: { type: mongoose.Schema.Types.ObjectId, ref: 'medias', required: false },
      bgColor: { type: String, required: false },
    },
    vendorTag: [{
      vendorTagId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendorTags', required: false },
    }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    menuItemAvailableTime: [{
      dayOfWeek: { type: String, required: false },
      timeSlot: { type: String, required: false },
    }],
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  menuItemSchema.pre('remove', removeDependecy);
  return mongoose.model('menuItems', menuItemSchema);
};

module.exports = menuItemsModel();
