/* eslint-disable func-names */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const config = require('../config/config');
const socket = require('../controllers/socket');
// middleWare to remove depedency table data
// eslint-disable-next-line func-names

const saveDependency = async function (next) {
  const socketIdRes = await this.constructor.findById({ _id: this._id }).populate([
    {
      path: 'orderId',
      model: 'orders',
    },
    {
      path: 'recipientId',
      model: 'recipients',
    },
  ]);
  const obj = {
    status: 'payments',
    res: socketIdRes,
  };
  const socketRes = await socket.updateOrderStatus(obj);
};

const removeDependecy = function (next) {
  next();
};
const transactionModel = () => {
  const transactionSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    paymentIntentId: { type: String, required: true },
    paymentType: { type: String, required: false },
    debitedFrom: { type: String, required: false },
    status: {
      type: String, required: true, enum: ['success', 'failed', 'fullRefund', 'partialRefund'],
    },
    amount: { type: String, required: true },
    balanceTransaction: { type: String, required: false },
    charge: { type: String, required: false },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  transactionSchema.post('save', saveDependency);
  transactionSchema.pre('remove', removeDependecy);
  return mongoose.model('transactions', transactionSchema);
};
module.exports = transactionModel();
