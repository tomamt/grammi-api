// Deprecated - remove v2
/* const mongoose = require('mongoose');

const DeliveryAgentModel = () => {
  const deliveryAgentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    agentName: { type: String, required: true },
    date: { type: Date, required: true },
    pickupTime: { type: String, required: true },
    deliveryTime: { type: String, required: true },
    arrivedTime: { type: String, required: true },
    pickedupTime: { type: String, required: true },
    deliveredTime: { type: String, required: true },
    dropOffInstruction: { type: String, required: true },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('orderDeliveryAgentDetails', deliveryAgentSchema);
};

module.exports = DeliveryAgentModel(); */
