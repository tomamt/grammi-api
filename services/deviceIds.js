// const debug = require('debug')('grammi-api:services/deviceIds');
// Models imports
const DeviceIds = require('../models/deviceIds');

const DeviceIdsService = {
  save: async (DeviceIdsData) => {
    const DeviceIdsModel = new DeviceIds(DeviceIdsData);
    const DeviceIdsRes = await DeviceIdsModel.save();
    return DeviceIdsRes;
  },
  getDeviceById: async (deviceId) => {
    const DeviceIdsRes = await DeviceIds.findById({ _id: deviceId });
    return DeviceIdsRes;
  },
  updateDeviceIds: async (obj) => {
    const DeviceIdsRes = DeviceIds.updateOne({ _id: obj.Id }, { $set: obj.data });
    return DeviceIdsRes;
  },
  deleteDeviceIds: async (deviceId) => {
    const doc = await DeviceIds.findOne({ _id: deviceId });
    const DeviceIdsRes = await doc.remove();
    return DeviceIdsRes;
  },
  getAllDeviceIds: async (obj) => {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const DeviceIdsRes = await DeviceIds.find({}).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return DeviceIdsRes;
  },
  totalDeviceCount: async () => {
    const DeviceIdsRes = DeviceIds.count({});
    return DeviceIdsRes;
  },
};

module.exports = DeviceIdsService;
