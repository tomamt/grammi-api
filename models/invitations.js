
// Deprecated - remove in v2

/* const mongoose = require('mongoose');

// mongoose middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = function (next) {
  // eslint-disable-next-line no-underscore-dangle
  // remove dependency data from other collections
  next();
};
const invitationsModel = () => {
  const invitationsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status: { type: String, required: true },
    expiry: { type: Date },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  invitationsSchema.pre('remove', removeDependecy);
  return mongoose.model('invitations', invitationsSchema);
};

module.exports = invitationsModel(); */
