const mongoose = require('mongoose');

const deviceIdsModel = () => {
  const deviceIdsSchema = new mongoose.Schema({
    deviceId: { type: String, required: true },
    firebaseToken: { type: String, required: false },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    verification: {
      type: String, enum: ['pending', 'verified'], default: 'pending',
    },
    deviceType: { type: String },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('deviceIds', deviceIdsSchema);
};

module.exports = deviceIdsModel();
