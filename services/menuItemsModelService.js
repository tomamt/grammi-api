const ModelService = require('./modelService');

class MenuItemModelService extends ModelService {
  // eslint-disable-next-line no-useless-constructor
  constructor(model) {
    super(model);
  }

  // List all records along with reference details
  async getAll(obj) {
    const query = obj ? obj.query : {};
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find(query).populate([
      /* {
        path: 'currencyId',
        model: 'currencies',
      }, */
      {
        path: 'mediaId.square',
        model: 'medias',
      },
      {
        path: 'mediaId.rectangle',
        model: 'medias',
      },
      {
        path: 'vendorId',
        model: 'vendors',
        populate: {
          path: 'venueId',
          model: 'venues',
        },
      },
      {
        path: 'vendorTagId',
        model: 'vendorTags',
      },
    ]);
    const result = await resultObject.skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return result;
  }

  // Get particular record along with reference  details
  async getById(Id) {
    const refResultObject = this.Model.findById({ _id: Id }).populate([
      /* {
        path: 'currencyId',
        model: 'currencies',
      }, */
      {
        path: 'mediaId.square',
        model: 'medias',
      },
      {
        path: 'mediaId.rectangle',
        model: 'medias',
      },
      {
        path: 'vendorId',
        model: 'vendors',
        populate: {
          path: 'venueId',
          model: 'venues',
        },
      },
      {
        path: 'vendorTagId',
        model: 'vendorTags',
      },
    ]);
    return refResultObject;
  }
}
module.exports = MenuItemModelService;
