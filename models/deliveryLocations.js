const mongoose = require('mongoose');

const DeliveryLocations = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas' },
  name: { type: String, required: [true, "can't be blank"] },
  address: { type: String, required: false },
  location: { type: { type: String, default: 'Point', required: false }, coordinates: [Number] },
  // latitude: { type: String, required: [true, "can't be blank"] },
  // longitude: { type: String, required: [true, "can't be blank"] },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('deliverylocations', DeliveryLocations);
