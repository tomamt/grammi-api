/**
 * Created by dibeesh on 18/11/19.
 */
const mongoose = require('mongoose');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = function (next) {
  next();
};
const ratingsModel = () => {
  const ratingsSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
    comment: { type: String }, // Optional
    experienceRating: { type: Number, required: true, enum: [1, 2, 3, 4, 5] },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  ratingsSchema.pre('remove', removeDependecy);
  return mongoose.model('ratings', ratingsSchema);
};
module.exports = ratingsModel();
