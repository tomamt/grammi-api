const mongoose = require('mongoose');

const DeliveryAgentsWorkingHours = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas' },
  clockIn: { type: Date, required: true },
  clockOut: { type: Date, required: false },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('deliveryAgentsWorkingHours', DeliveryAgentsWorkingHours);
