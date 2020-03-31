// const debug = require('debug')('grammi-api:services/vendors');

// Models imports
const Vendors = require('../models/vendors');

const VendorsService = {
  save: async (vendorsData) => {
    const vendorsModel = new Vendors(vendorsData);
    const vendorsRes = await vendorsModel.save();
    return vendorsRes;
  },
  getVendorById: async (vendorId) => {
    const vendorsRes = await Vendors.findById({ _id: vendorId });
    return vendorsRes;
  },
  updateVenue: async (obj) => {
    const vendorsRes = Vendors.updateOne({ _id: obj.Id }, { $set: obj.data });
    return vendorsRes;
  },
  deleteVenue: async (vendorId) => {
    const doc = await Vendors.findOne({ _id: vendorId });
    const vendorsRes = await doc.remove();
    return vendorsRes;
  },
};

module.exports = VendorsService;
