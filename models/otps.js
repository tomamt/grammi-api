/**
 * Created by dibeesh on 11/11/19.
 */
// Deprecated remove v2
/* const mongoose = require('mongoose');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = function (next) {
  next();
};
const otpsModel = () => {
  const otpsSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
    status: { type: String, required: true },
    from: { type: Number },
    to: { type: Number, required: true },
    deliveryId: { type: String },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  otpsSchema.pre('remove', removeDependecy);
  return mongoose.model('otps', otpsSchema);
};
module.exports = otpsModel(); */
