const CommonService = require('../services/commonService');

class DeliveryLocations extends CommonService {
  constructor(model) {
    super(model);
    this.Model = model;
  }

  async getAllListWithRef(obj) {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const result = await this.Model.find({}).populate('venueId', 'name').skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return result;
  }
}
module.exports = DeliveryLocations;

// const debug = require('debug')('grammi-api:services/deliveryLocations');
// Models imports
/* const DeliveryLocations = require('../models/deliveryLocations');

const DeliveryLocationsService = {
  save: async (deliveryLocationsData) => {
    const deliveryLocationsModel = new DeliveryLocations(deliveryLocationsData);
    const deliveryLocationsRes = await deliveryLocationsModel.save();
    return deliveryLocationsRes;
  },
  getdeliveryLocationById: async (deliveryLocationId) => {
    const deliveryLocationRes = await DeliveryLocations.findById({ _id: deliveryLocationId });
    return deliveryLocationRes;
  },
  getAllDeliveryLocation: async (obj) => {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const deliveryLocationRes = await DeliveryLocations.find({}).populate('venueId', 'name')
    .skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return deliveryLocationRes;
  },
  totalDeliveryLocationCount: async () => {
    const deliveryLocationRes = DeliveryLocations.count({});
    return deliveryLocationRes;
  },
  updateDeliveryLocation: async (obj) => {
    const deliveryLocationRes = DeliveryLocations.updateOne({ _id: obj.Id }, { $set: obj.data });
    return deliveryLocationRes;
  },
  deleteDeliveryLocation: async (deliveryLocationId) => {
    const deliveryLocationRes = await DeliveryLocations.deleteOne({ _id: deliveryLocationId });
    return deliveryLocationRes;
  },
};
module.exports = DeliveryLocationsService; */
