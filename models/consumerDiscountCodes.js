const mongoose = require('mongoose');

const consumerDiscountCodesModel = () => {
  const consumerDiscountCodesSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
    discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'discountCodes' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('consumerDiscountCodes', consumerDiscountCodesSchema);
};

module.exports = consumerDiscountCodesModel();
