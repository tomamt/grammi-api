// const debug = require('debug')('grammi-api:services/orderDeliveryAgentDetails');

// Models imports
const OrderDeliveryAgentDetails = require('../models/orderDeliveryAgentDetails');

const DeliveryAgentService = {
  save: async (DeliveryAgentData) => {
    const DeliveryAgentModel = new OrderDeliveryAgentDetails(DeliveryAgentData);
    const DeliveryAgentRes = await DeliveryAgentModel.save();
    return DeliveryAgentRes;
  },
  getDeliveryAgentById: async (orderDeliveryAgentDetailId) => {
    const DeliveryAgentRes = await OrderDeliveryAgentDetails
      .findById({ _id: orderDeliveryAgentDetailId });
    return DeliveryAgentRes;
  },
  updateDeliveryAgentDetails: async (obj) => {
    const DeliveryAgentRes = OrderDeliveryAgentDetails
      .updateOne({ _id: obj.Id }, { $set: obj.data });
    return DeliveryAgentRes;
  },
  deleteDeliveryAgentDetails: async (orderDeliveryAgentDetailId) => {
    const doc = await OrderDeliveryAgentDetails.findOne({ _id: orderDeliveryAgentDetailId });
    const DeliveryAgentRes = await doc.remove();
    return DeliveryAgentRes;
  },
  getAllDeliveryAgentDetail: async (obj) => {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const DeliveryAgentRes = await OrderDeliveryAgentDetails.find({}).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return DeliveryAgentRes;
  },
  totalDeviceCount: async () => {
    const DeliveryAgentRes = OrderDeliveryAgentDetails.count({});
    return DeliveryAgentRes;
  },
};

module.exports = DeliveryAgentService;
