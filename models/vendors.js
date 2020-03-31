const mongoose = require('mongoose');

const Vendors = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  crewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas' },
  deliveryLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliverylocations' },
  name: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String, required: true },
  contactName: { type: String },
  cuisineType: { type: String },
  license: { type: String },
  taxId: { type: String },
  address: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  deliveryTime: { type: String },
  category: { type: String },
  profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
  bgColor: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('vendors', Vendors);
