const mongoose = require('mongoose');
const config = require('../config/config');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = function (next) {
  next();
};
/* const preUpdate = async function (next) {
  //console.log('pre save', this.getUpdate()['$set'].status);
  let status = this.getUpdate()['$set'].status;
  if(status === 'locked') { //call auth0 to lock user
  }
  next();
}; */
const userModel = () => {
  const usersSchema = new mongoose.Schema({
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
    email: { type: String, required: true },
    name: { type: String },
    status: {
      type: String, required: true, enum: ['active', 'locked'], default: 'active',
    },
    auth0Id: { type: String, required: true, unique: true },
    userRole: { type: String, required: true, enum: config.api.roles },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  usersSchema.pre('remove', removeDependecy);
  // usersSchema.pre('updateOne', preUpdate);
  return mongoose.model('users', usersSchema);
};
module.exports = userModel();
