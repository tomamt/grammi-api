/* eslint-disable no-undef */
/* eslint-disable quote-props */
/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable quotes */
const moment = require('moment');
const mongoose = require('mongoose');
const ModelService = require('./modelService');

const { ObjectId } = mongoose.Types;
class AnalyticsModelService extends ModelService {
  // eslint-disable-next-line no-useless-constructor
  constructor(model) {
    super(model);
  }

  // List all records along with reference details
  async getTerminalGateAnalytics(obj) {
    const resultObject = this.Model.aggregate([
      {
        $match: {
          deliveryAreaId: ObjectId(obj.id),
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: '$deliveryLocationId',
          name: { $first: '$deliveryLocationName' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return resultObject;
  }

  async getOrdersEfficiencyAnalytics(obj) {
    const quarterHours = ["0", "15", "30", "45"];
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        times.push({ _id: { hour: i, interval: quarterHours[j] }, time: `${i}:${quarterHours[j]}` });
      }
    }
    const resultObject = this.Model.aggregate([
      {
        $match: {
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      // createdDate: {
      //   $gt: new Date((moment(obj.startDate).add(-(moment().utcOffset()), 'm'))),
      //   $lt: new Date((moment(obj.endDate).add(-(moment().utcOffset()), 'm'))),
      // },
      {
        $group: {
          _id: {
            hour: { $hour: { date: "$createdDate", timezone: obj.timeZone } },
            interval: {
              $subtract: [
                { $minute: { date: "$createdDate", timezone: obj.timeZone } },
                { $mod: [{ $minute: { date: "$createdDate", timezone: obj.timeZone } }, 15] },
              ],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      // {$sort:{"_id":1}},
      {
        $project: {
          time: { $concat: [{ $substr: ["$_id.hour", 0, -1] }, ":", { $substr: ["$_id.interval", 0, -1] }] },
          count: "$orderCount",
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: times,
              as: "month",
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ["$counts.time", "$$month.time"] } },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$counts", "$$dateIndex"] },
                      else: { _id: "$$month._id", time: "$$month.time", count: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$counts",
      },
      {
        $replaceRoot: {
          newRoot: "$counts",
        },
      },
    ]);
    return resultObject;
  }

  async getRatingEfficiencyAnalytics(obj) {
    const quarterHours = ["0", "15", "30", "45"];
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        times.push({ _id: { hour: i, interval: quarterHours[j] }, time: `${i}:${quarterHours[j]}` });
      }
    }
    const resultObject = this.Model.aggregate([
      {
        $match: {
          experienceRating: 5,
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: { date: "$createdDate", timezone: obj.timeZone } },
            interval: {
              $subtract: [
                { $minute: { date: "$createdDate", timezone: obj.timeZone } },
                { $mod: [{ $minute: { date: "$createdDate", timezone: obj.timeZone } }, 15] },
              ],
            },
          },
          // 'hours':  { '$first': { $hour: "$createdDate" } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          time: { $concat: [{ $substr: ["$_id.hour", 0, -1] }, ":", { $substr: ["$_id.interval", 0, -1] }] },
          count: "$orderCount",
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: times,
              as: "month",
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ["$counts.time", "$$month.time"] } },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$counts", "$$dateIndex"] },
                      else: { _id: "$$month._id", time: "$$month.time", count: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$counts",
      },
      {
        $replaceRoot: {
          newRoot: "$counts",
        },
      },
    ]);
    return resultObject;
  }

  async getCancellationEfficiencyAnalytics(obj) {
    const quarterHours = ["0", "15", "30", "45"];
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        times.push({ _id: { hour: i, interval: quarterHours[j] }, time: `${i}:${quarterHours[j]}` });
      }
    }
    const resultObject = this.Model.aggregate([
      {
        $match: {
          status: 'cancelled',
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: { date: "$createdDate", timezone: obj.timeZone } },
            interval: {
              $subtract: [
                { $minute: { date: "$createdDate", timezone: obj.timeZone } },
                { $mod: [{ $minute: { date: "$createdDate", timezone: obj.timeZone } }, 15] },
              ],
            },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          time: { $concat: [{ $substr: ["$_id.hour", 0, -1] }, ":", { $substr: ["$_id.interval", 0, -1] }] },
          count: "$orderCount",
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: times,
              as: "month",
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ["$counts.time", "$$month.time"] } },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$counts", "$$dateIndex"] },
                      else: { _id: "$$month._id", time: "$$month.time", count: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$counts",
      },
      {
        $replaceRoot: {
          newRoot: "$counts",
        },
      },
    ]);
    return resultObject;
  }

  async getDeliveriesEfficiencyAnalytics(obj) {
    const resultObject = this.Model.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'cancelled'] },
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    return resultObject;
  }

  async getAvgOrderTimeEfficiencyAnalytics(obj, query) {
    const quarterHours = ["0", "15", "30", "45"];
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        times.push({ _id: { hour: i, interval: quarterHours[j] }, time: `${i}:${quarterHours[j]}` });
      }
    }
    const resultObject = this.Model.aggregate([
      {
        $match: {
          deliveryAreaId: ObjectId(obj.deliveryAreaId),
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            hour: { $hour: { date: "$createdDate", timezone: obj.timeZone } },
            interval: {
              $subtract: [
                { $minute: { date: "$createdDate", timezone: obj.timeZone } },
                { $mod: [{ $minute: { date: "$createdDate", timezone: obj.timeZone } }, 15] },
              ],
            },
          },
          avgTime: query,
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          time: { $concat: [{ $substr: ["$_id.hour", 0, -1] }, ":", { $substr: ["$_id.interval", 0, -1] }] },
          avgTime: "$avgTime",
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: times,
              as: "month",
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ["$counts.time", "$$month.time"] } },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$counts", "$$dateIndex"] },
                      else: { _id: "$$month._id", time: "$$month.time", avgTime: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$counts",
      },
      {
        $replaceRoot: {
          newRoot: "$counts",
        },
      },
    ]);
    return resultObject;
  }

  async getVendorAnalytics(obj, query) {
    let timeValues = [];
    const dateStart = moment(obj.startDate);
    const dateEnd = moment(obj.endDate);
    while (dateStart < dateEnd) {
      timeValues.push(dateStart.format('MM'));
      dateStart.add(1, 'month');
    }
    timeValues = timeValues.filter((v, i, a) => a.indexOf(v) === i).sort();
    const resultObject = this.Model.aggregate([
      {
        $match: {
          vendorId: ObjectId(obj.vendorId),
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdDate' },
          totalCount: query,
        },
      },
      { $sort: { month: 1 } },
      {
        $project: {
          count: '$totalCount',
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: timeValues.map(Number),
              as: 'month',
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ['$counts._id', '$$month'] } },
                  in: {
                    $cond: {
                      if: { $ne: ['$$dateIndex', -1] },
                      then: { $arrayElemAt: ['$counts', '$$dateIndex'] },
                      else: { _id: '$$month', count: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: '$counts',
      },
      {
        $replaceRoot: {
          newRoot: '$counts',
        },
      },
    ]);
    return resultObject;
  }

  async getVendorAvgAnalytics(obj, query) {
    let timeValues = [];
    const dateStart = moment(obj.startDate, 'YYYY-MM-DD');
    const dateEnd = moment(obj.endDate, 'YYYY-MM-DD');
    while (dateStart < dateEnd) {
      timeValues.push(dateStart.format('MM'));
      dateStart.add(1, 'month');
    }
    timeValues = timeValues.filter((v, i, a) => a.indexOf(v) === i).sort();
    const resultObject = this.Model.aggregate([
      {
        $match: {
          [obj.field]: ObjectId(obj.vendorId),
          [obj.fieldname]: { $ne: null },
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdDate" },
          avgTime: query,
        },
      },
      { $sort: { month: 1 } },
      {
        $project: {
          avgTime: "$avgTime",
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: timeValues.map(Number),
              as: "month",
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ["$counts._id", "$$month"] } },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$counts", "$$dateIndex"] },
                      else: { _id: "$$month", avgTime: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$counts",
      },
      {
        $replaceRoot: {
          newRoot: "$counts",
        },
      },
    ]);
    return resultObject;
  }

  async getVendorLocationAnalytics(obj) {
    const resultObject = this.Model.aggregate([
      {
        $match: {
          vendorId: ObjectId(obj.vendorId),
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: '$deliveryLocationId',
          name: { $first: '$deliveryLocationName' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { deliveryLocationId: 1 } },
    ]);
    return resultObject;
  }

  async getVendorCategoryAnalytics(obj) {
    const resultObject = this.Model.aggregate([
      {
        $match: {
          vendorId: ObjectId(obj.vendorId),
          menuItemId: { $ne: null },
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $lookup: {
          from: 'vendormenusections',
          localField: "menuItemId",
          foreignField: "menuItems.menuItemId",
          as: 'category',
          // let: { menuItemId: '$menuItemId' },
          // pipeline: [
          //   {
          //     // $match: {
          //     //   vendorId: ObjectId(obj.vendorId),
          //     // },
          //     $match: {
          //       $expr: {
          //         $eq: [
          //           "$menuItemId",
          //           "$$menuItemId",
          //         ],
          //       },
          //     },
          //   },

          // ],
        },
      },
      {
        $group: {
          _id: { menuItemId: "$menuItemId", categorymenuItemId: "$category.menuItems.menuItemId" },
          categoryId: { $first: "$category._id" },
          name: { $first: "$category.name" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          categoryId: "$categoryId",
          name: "$name",
          count: {
            $cond: {
              if: { $ne: ["$_id._id", null] },
              then: "$count",
              else: 0,
            },
          },
        },
      },
      // {
      //   $group: {
      //     _id: "$categoryId",
      //     categoryname: { $first: "$name" },
      //     count: { $sum: "$count" },
      //   },
      // },
    ]);
    return resultObject;
  }

  async getTerminalAvgBetweenDeliveriesTimeAnalytics(obj, query) {
    let timeValues = [];
    const dateStart = moment(obj.startDate);
    const dateEnd = moment(obj.endDate);
    while (dateStart < dateEnd) {
      timeValues.push(dateStart.format('MM'));
      dateStart.add(1, 'month');
    }
    timeValues = timeValues.filter((v, i, a) => a.indexOf(v) === i).sort();
    const resultObject = this.Model.aggregate([
      {
        $match: {
          deliveryAreaId: ObjectId(obj.deliveryAreaId),
          createdDate: {
            $gt: new Date(obj.startDate),
            $lt: new Date(obj.endDate),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdDate" },
          avgTime: query,
        },
      },
      { $sort: { month: 1 } },
      {
        $project: {
          avgTime: "$avgTime",
        },
      },
      {
        $group: {
          _id: null,
          counts: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          counts: {
            $map: {
              input: timeValues.map(Number),
              as: "month",
              in: {
                $let: {
                  vars: { dateIndex: { $indexOfArray: ["$counts._id", "$$month"] } },
                  in: {
                    $cond: {
                      if: { $ne: ["$$dateIndex", -1] },
                      then: { $arrayElemAt: ["$counts", "$$dateIndex"] },
                      else: { _id: "$$month", avgTime: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$counts",
      },
      {
        $replaceRoot: {
          newRoot: "$counts",
        },
      },
    ]);
    return resultObject;
  }
}

module.exports = AnalyticsModelService;
