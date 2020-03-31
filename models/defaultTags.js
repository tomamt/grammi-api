const mongoose = require('mongoose');

const defaultTags = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('defaultTags', defaultTags);
