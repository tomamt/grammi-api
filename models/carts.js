const mongoose = require('mongoose');

const Carts = new mongoose.Schema({
  transactionIdentifier: { type: String, required: true },
  recipientName: { type: String, required: false },
  recipientPhoneNumber: { type: String, required: false },
  paymentIntentId: { type: String },
  menuItems: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'menuItems' },
    quantity: { type: Number },
    deliverRestOfOrder: { type: Boolean, default: true },
  }],
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'venues' },
  venueName: { type: String, required: false },
  vendorName: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients', required: false },
  discountCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'discountCodes', required: false },
  deliveryLocationId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliverylocations', required: false },
  deliveryLocationName: { type: String, required: false },
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas', required: false },
  deliveryAreaName: { type: String, required: false },
  subTotal: { type: Number, required: true },
  discount: { type: String, required: false, default: '0' },
  discountAmount: { type: Number, required: false, default: 0 },
  tax: { type: String, required: true },
  taxAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, required: true },
  packingCharge: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  expectedDeliveryTime: { type: Date, required: false },
  currency: { type: String, required: true },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('carts', Carts);
