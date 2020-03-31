const mongoose = require('mongoose');

const MenuItemTags = new mongoose.Schema({
  vendorTagId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendorTags', required: true },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('menuItemTags', MenuItemTags);
