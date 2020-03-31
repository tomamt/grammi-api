class CommonService {
  constructor(model) {
    this.Model = model;
  }

  async save(data) {
    const model = new this.Model(data);
    const result = await model.save();
    return result;
  }

  async getById(Id) {
    const result = await this.Model.findById({ _id: Id });
    return result;
  }

  async getByCustomField(obj) {
    const result = await this.Model.find(obj.query);
    return result;
  }

  async getAllList(obj) {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const result = await this.Model.find({}).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return result;
  }

  async totalCount() {
    const result = await this.Model.count({});
    return result;
  }

  async update(obj) {
    const result = await this.Model.updateOne({ _id: obj.Id }, { $set: obj.data });
    return result;
  }

  async delete(Id) {
    const result = await this.Model.deleteOne({ _id: Id });
    return result;
  }
}
module.exports = CommonService;
