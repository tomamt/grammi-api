/* eslint-disable func-names */
const mongoose = require('mongoose');
const menuItemsModel = require('../models/menuItems');

const numberFormat = async (number) => {
  const num = parseFloat(number).toFixed(2).split('.');
  const num1 = num[0].length < 2 ? num[0].padStart(2, '0') : num[0];
  const num2 = num[1].length < 2 ? num[1].padEnd(2, '0') : num[1];
  const finalNum = `${num1}.${num2}`;
  return finalNum;
};

const menuItemUpdationOfAvailTime = async (menuItemId, dayOfWeek, updateTimeSlotList) => {
  let push = true;
  const updateData = {
    dayOfWeek,
    timeSlot: updateTimeSlotList,
  };
  const menuItemDetails = await menuItemsModel.findById({ _id: menuItemId });
  if (menuItemDetails !== null) {
    await menuItemDetails.menuItemAvailableTime.forEach(async (element, index) => {
      if (element.dayOfWeek === dayOfWeek) {
        push = false;
        const data = Object.assign(element.toObject(), {
          // eslint-disable-next-line no-underscore-dangle
          _id: element._id,
          dayOfWeek: element.dayOfWeek,
          timeSlot: updateTimeSlotList,
        });
        menuItemDetails.menuItemAvailableTime[index] = data;
        if (menuItemDetails.menuItemAvailableTime[index].timeSlot !== '') {
          await menuItemsModel.updateOne(
            { _id: menuItemId },
            { $set: { menuItemAvailableTime: menuItemDetails.menuItemAvailableTime } },
          );
        } else {
          await menuItemsModel.updateOne(
            { _id: menuItemId },
            // eslint-disable-next-line no-underscore-dangle
            { $pull: { menuItemAvailableTime: { _id: element._id } } }, { upsert: true },
          );
        }
      }
    });
  }
  if (push === true) {
    await menuItemsModel.updateOne(
      { _id: menuItemId },
      { $push: { menuItemAvailableTime: updateData } }, { upsert: true },
    );
  }
};

const addAvailTimeMenuItem = async function () {
  let updateTimeSlotList;
  const newTimeSlot = `${await numberFormat(this.opening)} - ${await numberFormat(this.closing)}`;
  const menuAvailTimeList = await this.constructor.find({
    $and: [
      { menuItemId: this.menuItemId },
      { dayOfWeek: this.dayOfWeek },
    ],
  });
  const timelist = await Promise.all(menuAvailTimeList.map(async (element) => `${await numberFormat(element.opening)} - ${await numberFormat(element.closing)}`));
  const timeSlotlist = Array.prototype.map.call(timelist, (s) => `${s}`).toString();
  if (timeSlotlist !== '') {
    updateTimeSlotList = `${timeSlotlist},${newTimeSlot}`;
  } else {
    updateTimeSlotList = newTimeSlot;
  }
  await menuItemUpdationOfAvailTime(this.menuItemId, this.dayOfWeek, updateTimeSlotList);
};

const updateAvailTimeMenuItem = async function () {
  // eslint-disable-next-line no-underscore-dangle
  const upadtedMenuAvailTime = await this.model.findById(this._conditions);
  if (upadtedMenuAvailTime !== null) {
    const { menuItemId } = upadtedMenuAvailTime;
    const { dayOfWeek } = upadtedMenuAvailTime;
    const menuAvailTimeList = await this.model.find({
      $and: [
        { menuItemId },
        { dayOfWeek },
      ],
    });
    const timelist = await Promise.all(menuAvailTimeList.map(async (element) => `${await numberFormat(element.opening)} - ${await numberFormat(element.closing)}`));
    const updateTimeSlotList = Array.prototype.map.call(timelist, (s) => `${s}`).toString();
    await menuItemUpdationOfAvailTime(menuItemId, dayOfWeek, updateTimeSlotList);
  }
};

const removeAvailTimeMenuItem = async function () {
  // eslint-disable-next-line no-underscore-dangle
  const upadtedMenuAvailTime = await this.constructor.findById({ _id: this._id });
  const deleteTimeSlot = `${await numberFormat(this.opening)} - ${await numberFormat(this.closing)}`;
  if (upadtedMenuAvailTime !== null) {
    const { menuItemId } = upadtedMenuAvailTime;
    const { dayOfWeek } = upadtedMenuAvailTime;
    const menuAvailTimeList = await this.constructor.find({
      $and: [
        { menuItemId },
        { dayOfWeek },
      ],
    });
    const timelist = await Promise.all(menuAvailTimeList.map(async (element) => `${await numberFormat(element.opening)} - ${await numberFormat(element.closing)}`));
    const timeSlotlist = Array.prototype.map.call(timelist, (s) => `${s}`).toString();
    const timeSlotArray = timeSlotlist.split(',');
    const Data = [];
    timeSlotArray.forEach((element) => {
      if (element !== deleteTimeSlot) {
        Data.push(element);
      }
    });
    const updateTimeSlotList = Array.prototype.map.call(Data, (s) => s).toString();
    await menuItemUpdationOfAvailTime(menuItemId, dayOfWeek, updateTimeSlotList);
  }
};


const menuItemAvailableHoursModel = () => {
  const menuItemAvailableHoursSchema = new mongoose.Schema({
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItems', required: true },
    // dayofWeek start with sunday
    dayOfWeek: {
      type: String, min: 1, max: 7, required: true,
    },
    opening: {
      type: String, min: 0, max: 24, required: true,
    },
    closing: {
      type: String, min: 0, max: 24, required: true,
    },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  menuItemAvailableHoursSchema.pre('save', addAvailTimeMenuItem);
  menuItemAvailableHoursSchema.post('updateOne', updateAvailTimeMenuItem);
  menuItemAvailableHoursSchema.pre('remove', removeAvailTimeMenuItem);
  return mongoose.model('menuItemAvailableHours', menuItemAvailableHoursSchema);
};

module.exports = menuItemAvailableHoursModel();
