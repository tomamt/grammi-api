/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
// const debug = require('debug')('grammi-api:controllers/invitations');
const moment = require('moment');
const generator = require('generate-password');
const randomColor = require('randomcolor');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;
const utilities = {
  addMoment: (dateTime, increment, type) => {
    const output = {};
    output.status = true;
    if (type === 'days') {
      output.dateTime = moment(dateTime).add(increment, 'days');
    } else if (type === 'months') {
      output.dateTime = moment(dateTime).add(increment, 'months');
    } else if (type === 'years') {
      output.dateTime = moment(dateTime).add(increment, 'years');
    } else if (type === 'hours') {
      output.dateTime = moment(dateTime).add(increment, 'hours');
    } else if (type === 'minutes') {
      output.dateTime = moment(dateTime).add(increment, 'minutes');
    } else {
      output.error = 'Unsupported type';
      output.status = false;
    }
    return output;
  },
  createRandomKey: (options) => {
    const password = generator.generate(options);
    return password;
  },
  createOtp: (length) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i += 1) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  },
  padNumber: (number, length) => {
    let str = `${number}`;
    while (str.length < length) {
      str = `0${str}`;
    }
    return str;
  },
  randomColorCode: (options) => {
    const color = randomColor(options); // a hex code for an attractive color
    return color;
  },
  customRandomColorCode: (options) => {
    const colorCodes = ['#67E0F0', '#BD67F0', '#F07867', '#9BF067', '#DFF067'];
    const randomItem = colorCodes[Math.floor(Math.random() * colorCodes.length)];
    return randomItem;
  },
  CreateObjectId: (id) => ObjectId(id),
  findTimeDifference: (startTime, endTime, unit) => { // Find time diff
    const units = unit || 'minutes';
    const end = moment(endTime);
    const start = moment(startTime);
    const difference = end.diff(start, units);
    return difference;
  },
};
module.exports = utilities;
