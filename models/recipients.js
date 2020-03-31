/**
 * Created by dibeesh on 11/11/19.
 */
const mongoose = require('mongoose');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = function (next) {
  next();
};
const recipientsModel = () => {
  const recipientsSchema = new mongoose.Schema({
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
    name: { type: String },
    phoneNumber: {
      type: String,
      unique: true,
      validate: {
        validator(v) {
          return /^[0-9]*$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      required: [true, 'User phone number required'],
    },
    status: {
      type: String, required: true, enum: ['active', 'locked'], default: 'active',
    },
    verification: {
      type: String, required: true, enum: ['pending', 'approved'], default: 'pending',
    },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  recipientsSchema.pre('remove', removeDependecy);
  return mongoose.model('recipients', recipientsSchema);
};
module.exports = recipientsModel();
