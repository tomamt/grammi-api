const mongoose = require('mongoose');

const Dropdowns = new mongoose.Schema({
  type: { type: String, required: true },
  value: { type: String, required: true },
  displayName: { type: String, required: true },
  order: { type: String, required: true },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('dropdowns', Dropdowns);
