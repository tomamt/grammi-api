/**
 * Created by dibeesh on 20/11/19.
 */
const mongoose = require('mongoose');

const DeliveryAreas = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
  name: { type: String, required: [true, "can't be blank"] },
  prefix: { type: String, required: [true, "can't be blank"] },
  lastOrderId: { type: Number, required: false, default: 0 },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('deliveryareas', DeliveryAreas);
