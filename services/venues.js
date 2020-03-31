/* const debug = require('debug')('grammi-api:services/venues');

// Models imports
const Venues = require('../models/venues');

const VenuesService = {
  save: async (venuesData) => {
    const venueModel = new Venues(venuesData);
    const venueRes = await venueModel.save();
    return venueRes;
  },
  getVenueById: async (venueId) => {
    const venueRes = await Venues.findById({ _id: venueId });
    return venueRes;
  },
  updateVenue: async (obj) => {
    const venueRes = Venues.updateOne({ _id: obj.Id }, { $set: obj.data });
    return venueRes;
  },
  deleteVenue: async (venueId) => {
    const doc = await Venues.findOne({ _id: venueId });
    const venueRes = await doc.remove();
    return venueRes;
  },
  getAllVenue: async (obj) => {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const venueRes = await Venues.find({}).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return venueRes;
  },
  totalVenueCount: async () => {
    const venueRes = Venues.count({});
    return venueRes;
  },
};

module.exports = VenuesService; */
