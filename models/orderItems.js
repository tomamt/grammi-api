const mongoose = require('mongoose');


const orderItemsModel = () => {
  const orderItemsSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItems' },
    status: {
      type: String,
      enum: ['pending', 'fired', 'ready'],
      default: 'pending',
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors' },
    name: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    deliverRestOfOrder: { type: Boolean },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

  return mongoose.model('orderItems', orderItemsSchema);
};

module.exports = orderItemsModel();
