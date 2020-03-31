const mongoose = require('mongoose');

const vendorMenuSections = new mongoose.Schema({
  name: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
  menuItems: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItems', required: false },
  }],
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('vendorMenuSections', vendorMenuSections);
