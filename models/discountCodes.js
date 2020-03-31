const mongoose = require('mongoose');

const discountCodesModel = () => {
  const discountCodesSchema = new mongoose.Schema({
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
    code: { type: String, required: true },
    name: { type: String },
    minimumOrderAmount: { type: String, required: true },
    maximumLimit: { type: String, required: true },
    usageLimit: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    offerPercentage: { type: Number, required: true },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('discountCodes', discountCodesSchema);
};

module.exports = discountCodesModel();
