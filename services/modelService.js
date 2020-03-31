/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable quotes */
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment');

class ModelService {
  constructor(model) {
    this.Model = model;
  }

  // adding record
  async saveMultipleData(data) {
    try {
      const result = await this.Model.insertMany(data);
      return result;
    } catch (e) {
      return e;
    }
  }

  async save(data) {
    const model = new this.Model(data);
    const result = await model.save();
    return result;
  }

  // Get particular record
  async getById(Id) {
    const result = await this.Model.findById({ _id: Id });
    return result;
  }

  async getByCustomField(obj) {
    const result = await this.Model.find(obj.query);
    return result;
  }

  async getdeliveryAgentHoursDetails(obj) {
    const result = await this.Model.aggregate([
      { $match: obj },
      {
        $project: {
          createdDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdDate' } },
          clockIn: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$clockIn' } },
          clockOut: { $dateToString: { format: '%Y-%m-%d %H:%M', date: '$clockOut' } },
          venueId: 1,
          userId: 1,
        },
      },
      { $sort: { _id: -1 } },
    ]);
    return result;
  }

  async getMinimumOrderDaList(id) {
    const result = await this.Model.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "assignee",
          foreignField: "_id",
          as: "nested_users",
        },
      },
      {
        $unwind: "$nested_users",
      },
      {
        $match: {
          status: { $nin: ['cancelled', 'delivered'] },
          "nested_users.userRole": "deliveryAgent",
          "nested_users._id": { $ne: ObjectId(id) },
          "nested_users.status": "active",
          // createdDate: {
          //   $gt: new Date(startDate),
          //   $lt: new Date(endDate),
          // },
        },
      },
      {
        $group: {
          _id: "$nested_users._id",
          name: { $first: "$nested_users.name" },
          // names:{$addToSet: {name: "$nested_users.name"}},
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { orderCount: 1 } },
    //  {$limit: 10}
    ]);
    return result;
  }

  async getDaList(id) {
    const result = await this.Model.aggregate([
      {
        $lookup: {
          from: 'deliveryagentsworkinghours',
          localField: '_id',
          foreignField: 'userId',
          as: 'users_list',
        },
      },
      {
        $unwind: '$users_list',
      },
      {
        $match: {
          userRole: 'deliveryAgent', _id: { $ne: ObjectId(id) }, status: 'active',
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          clockOut: { $last: '$users_list.clockOut' },
          // names:{$addToSet: {name: "$nested_users.name"}},
          orderCount: { $sum: 0 },

        },
      },
      { $sort: { orderCount: 1 } },
    ]);
    return result;
  }

  // List all records
  async getAll(obj) {
    const skip = parseInt(obj.pageSize, 10) * (parseInt(obj.pageNo, 10) - 1);
    const query = obj.query || {};
    // console.log('query', query);
    const result = await this.Model.find(query).skip(skip)
      .limit(parseInt(obj.pageSize, 10))
      .sort({ [obj.sortColumn]: parseInt(obj.sortValue, 10) });
    return result;
  }

  // Get total count of records present
  async totalCount(obj) {
    const query = obj ? obj.query : {};
    const result = await this.Model.countDocuments(query);
    return result;
  }

  // update the particular record
  async update(obj) {
    const options = obj.options || {};
    const result = await this.Model.updateOne({ _id: obj.Id }, { $set: obj.data }, options);
    return result;
  }

  // update custom field
  async updateCustomField(obj) {
    const options = obj.options || {};
    const result = await this.Model.updateOne(obj.query, { $set: obj.data }, options);
    return result;
  }

  // update updateArrayField
  async updateArrayField(obj) {
    const options = obj.options || {};
    const query = obj.query || {};
    const data = obj.data || {};
    const result = await this.Model.updateOne(query, data, options);
    return result;
  }

  // delete the particular record
  async delete(Id) {
    const result = await this.Model.deleteOne({ _id: Id });
    return result;
  }

  // Delete the child table record and then parent class record
  async deleteRemove(Id) {
    const resultObject = await this.Model.findOne({ _id: Id });
    let result = '';
    if (resultObject === null) {
      result = await this.Model.deleteOne({ _id: Id });
      return result;
    }
    result = await resultObject.remove();
    return result;
  }

  async deleteMenuItemHours(Id) {
    const resultObject = await this.Model.find({ menuItemId: Id });
    let result = '';
    if (resultObject === null) {
      result = await this.Model.delete({ menuItemId: Id });
      return result;
    }
    result = await this.Model.remove({ menuItemId: Id });
    return result;
  }
}
module.exports = ModelService;
