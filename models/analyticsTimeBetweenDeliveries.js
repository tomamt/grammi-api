/**
 * Created by dibeesh on 21/1/20.
 */
const mongoose = require('mongoose');

const analyticsTimeBetweenDeliveries = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'vendors', required: true },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  deliveryAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryareas' },
  // in minutes - Orderpickup - previous order delivered based on da, terminal, clocked in
  timeBetweenDeliveries: { type: String, required: true },
}, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });

module.exports = mongoose.model('analyticsTimeBetweenDeliveries', analyticsTimeBetweenDeliveries);
