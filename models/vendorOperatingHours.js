const mongoose = require('mongoose');

const vendorOperatingHoursModel = () => {
  const vendorOperatingHoursSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
    dayOfWeek: {
      type: String, min: 1, max: 7, required: true,
    },
    opening: {
      type: String, min: 0, max: 24, required: true,
    },
    closing: {
      type: String, min: 0, max: 24, required: true,
    },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('vendorOperatingHours', vendorOperatingHoursSchema);
};

module.exports = vendorOperatingHoursModel();
