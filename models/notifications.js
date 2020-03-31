// Deprecated - Remove v2

/* const mongoose = require('mongoose');

const notificationsModel = () => {
  const notificationsSchema = new mongoose.Schema({
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
    type: { type: String, required: true },
    status: { type: String, required: true },
    message: { type: String, required: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('notifications', notificationsSchema);
};

module.exports = notificationsModel(); */
