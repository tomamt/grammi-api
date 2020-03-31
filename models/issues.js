/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const ModelService = require('../services/referencedModelService');
const Constant = require('../utilities/constant');
const orderModel = require('./orders');
const socket = require('../controllers/socket');

const orderReferences = Constant.reference.order;
const orderService = new ModelService(orderModel, orderReferences);

const updateDependecy = async function (next) {
  const { orderId, type, _id } = this;
  const issueList = ['consumer-issue', 'crew-issue', 'da-issue', 'da-break', 'da-unavailable'];
  const isIn = issueList.find((x) => x === type);
  if (isIn) {
    const daRes = await this.constructor.findOne({ _id }).populate([
      {
        path: 'orderId',
        model: 'orders',
        populate: {
          path: 'assignee',
          model: 'users',
        },
      },
      {
        path: 'voiceRecordingId',
        model: 'medias',
      },
      {
        path: 'reporter',
        model: 'users',
      },
      {
        path: 'orderProblemId',
        model: 'dropdowns',
      },
    ]);
    const response = { status: type, res: daRes };
    const socketRes = await socket.updateIssueStatus(response);
    if (type !== 'consumer-issue') {
      const obj = { Id: orderId, data: { status: type } };
      const statusRes = await orderService.update(obj);
    }
  }
  // next();
};
const issuesModel = () => {
  const issuesSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'orders' },
    voiceRecordingId: { type: mongoose.Schema.Types.ObjectId, ref: 'medias' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'recipients' },
    type: {
      type: String, required: true, enum: ['consumer-issue', 'crew-issue', 'da-issue', 'da-break', 'da-unavailable'],
    },
    reportedDate: { type: Date, default: Date.now },
    resolvedDate: { type: Date },
    assignedDate: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ['open', 'closed'],
      default: 'open',
    },
    orderProblemId: { type: mongoose.Schema.Types.ObjectId, ref: 'dropdowns' },
    comment: { type: String, required: false },
    actions: {
      type: String,
      required: true,
      enum: ['refund-initiated', 'refund-complete', 'credit-next-order', 'lock-da', 'lock-consumer', 'resolved', 'pending'],
      default: 'pending',
    },
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  issuesSchema.post('save', updateDependecy);
  return mongoose.model('issues', issuesSchema);
};

module.exports = issuesModel();
