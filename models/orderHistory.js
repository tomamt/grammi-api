const mongoose = require('mongoose');

const orderHistoryModel = () => {
  const orderHistorySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    action: { type: String },
    key: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

  return mongoose.model('orderHistory', orderHistorySchema);
};

module.exports = orderHistoryModel();
