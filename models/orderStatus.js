/* eslint-disable max-len */
const mongoose = require('mongoose');


const orderStatusModel = () => {
  const orderStatusSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    cancellationReasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdowns' },
    // status: { type: String, required: true },
    status: {
      type: String,
      enum: ['placed', 'fired', 'ready', 'pickedup', 'arrived', 'delivered', 'issue', 'cancelled'],
      /*     enum: ['placed', 'confirmed', 'processing', 'ready', 'pickedup', 'inroute', 'arrived', 'delivered', 'issue',
        'cancelled'], */
      required: true,
    },
    date: { type: Date },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

  return mongoose.model('orderStatus', orderStatusSchema);
};

module.exports = orderStatusModel();
