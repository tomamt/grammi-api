const ModelService = require('./modelService');

class CartsModelService extends ModelService {
  // eslint-disable-next-line no-useless-constructor
  constructor(model) {
    super(model);
  }

  // List all records along with reference details
  async getAll(obj) {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find({}).populate({
      path: 'menuItems.menuItemId',
      model: 'menuItems',
      populate: [
        { path: 'mediaId.square', model: 'medias' },
        { path: 'mediaId.rectangle', model: 'medias' },
        // { path: 'currencyId', model: 'currencies' },
        { path: 'vendorId', model: 'vendors' },
        { path: 'vendorTagId', model: 'vendorTags' },
      ],
    });
    const result = await resultObject.skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return result;
  }

  // Get particular record along with reference  details
  async getById(Id) {
    const refResultObject = this.Model.findById({ _id: Id }).populate([
      {
        path: 'menuItems.menuItemId',
        model: 'menuItems',
        populate: [
          { path: 'mediaId.square', model: 'medias' },
          { path: 'mediaId.rectangle', model: 'medias' },
          // { path: 'currencyId', model: 'currencies' },
          { path: 'vendorId', model: 'vendors' },
          { path: 'vendorTagId', model: 'vendorTags' },
        ],
      },
      {
        path: 'vendorId',
        model: 'vendors',
      },
      {
        path: 'discountCodeId',
        model: 'discountCodes',
      },
    ]);
    return refResultObject;
  }
}
module.exports = CartsModelService;
