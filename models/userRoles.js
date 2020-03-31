const mongoose = require('mongoose');
const config = require('../config/config');

// middleWare to remove depedency table data
// eslint-disable-next-line func-names
const removeDependecy = function (next) {
  // eslint-disable-next-line no-underscore-dangle
  // remove dependency data from other collections
  next();
};
const userRoleModel = () => {
  const userRolesSchema = new mongoose.Schema({
    name: {
      type: String, required: true, unique: true, enum: config.api.roles,
    },
    displayName: { type: String, required: true },
    auth0RoleId: { type: String, required: true },
    menus: { type: Array, required: true },
    apiRoutes: { type: String },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  userRolesSchema.pre('remove', removeDependecy);
  return mongoose.model('userRoles', userRolesSchema);
};
module.exports = userRoleModel();
