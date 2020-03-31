// const debug = require('debug')('grammi-api:services/dropdowns');
// Models imports
// const Dropdowns = require('../models/dropdowns');

/* class DropdownsService {
    constructor(dropdowns) {
      this.dropdownsModel = dropdowns;
    }

//}

//const DropdownsService = {
  async save  (DropdownsData) {
    const DropdownsModel = new this.dropdownsModel(DropdownsData);
    const dropdownRes = await DropdownsModel.save();
    return dropdownRes;
  };
  getDropdownById: async (deliveryLocationId) => {
    const dropdownRes = await Dropdowns.findById({ _id: deliveryLocationId });
    return dropdownRes;
  },
  getAllDropdown: async (obj) => {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const dropdownRes = await Dropdowns.find({}).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return dropdownRes;
  },
  totalDropdownCount: async () => {
    const dropdownRes = Dropdowns.count({});
    return dropdownRes;
  },
  updateDropdown: async (obj) => {
    const dropdownRes = Dropdowns.updateOne({ _id: obj.Id }, { $set: obj.data });
    return dropdownRes;
  },
  deleteDropdown: async (deliveryLocationId) => {
    const dropdownRes = await Dropdowns.deleteOne({ _id: deliveryLocationId });
    return dropdownRes;
  },
};
module.exports = DropdownsService; */
