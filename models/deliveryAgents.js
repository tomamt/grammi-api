const mongoose = require('mongoose');

const deliveryAgents = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas', default: null },
  phoneNumber: { type: String },
  empId: { type: String },
  // sex: { type: String },
  // age: { type: String },
  // profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('deliveryagents', deliveryAgents);
