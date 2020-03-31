/**
 * Created by dibeesh on 9/12/19.
 */
const ModelService = require('../services/referencedModelService');

class OrderModelService extends ModelService {
  constructor(model, references) {
    super(model);
    this.model = model;
    this.references = references;
  }

  async getAllIssues(obj) {
    const query = obj ? obj.query : {};
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const resultObject = this.Model.find(query).populate([
      {
        path: 'orderId',
        model: 'orders',
        populate: {
          path: 'assignee',
          model: 'users',
        },
      },
      {
        path: 'voiceRecordingId',
        model: 'medias',
      },
      {
        path: 'reporter',
        model: 'users',
      },
      {
        path: 'orderProblemId',
        model: 'dropdowns',
      },
    ]).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return resultObject;
  }
}
module.exports = OrderModelService;
