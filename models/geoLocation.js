const mongoose = require('mongoose');

const GeoLocation = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
  deviceId: { type: String, required: true },
  deviceType: { type: String },
  applicationType: { type: String },
  ipAddress: { type: String },
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas' },
  action: { type: String },
  capturedDate: { type: Date },
  location: { type: { type: String, default: 'Point', required: false }, coordinates: [Number] },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('geoLocation', GeoLocation);
