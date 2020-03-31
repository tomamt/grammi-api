const mongoose = require('mongoose');
const vendorMenuSections = require('../models/vendorMenuSections');
const menuItemsModel = require('../models/menuItems');
const menuItemTagsModel = require('../models/menuItemTags');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = async function (next) {
  // eslint-disable-next-line no-underscore-dangle
  const id = this._id;
  const isVendorTagExist = await vendorMenuSections.findOne({ vendorTagId: id }).exec();
  const ismenuItemsExist = await menuItemsModel.findOne({ vendorTagId: id }).exec();
  const ismenuItemTagExist = await menuItemTagsModel.findOne({ vendorTagId: id }).exec();
  if (isVendorTagExist) {
    vendorMenuSections.remove({ vendorTagId: id }).exec();
  }
  if (ismenuItemsExist) {
    menuItemsModel.remove({ vendorTagId: id }).exec();
  }
  if (ismenuItemTagExist) {
    menuItemTagsModel.remove({ vendorTagId: id }).exec();
  }
  next();
};

const vendorTagsModel = () => {
  const vendorTagsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
    defaultTagId: { type: mongoose.Schema.Types.ObjectId, ref: 'defaultTags', required: false },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  vendorTagsSchema.pre('remove', removeDependecy);
  return mongoose.model('vendorTags', vendorTagsSchema);
};

module.exports = vendorTagsModel();
