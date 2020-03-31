// const debug = require('debug')('grammi-api:middleware/response');
const Constant = require('../utilities/constant');

const ResponseMiddleWare = {
  saveResponse: async (req, res) => {
    if (res.data) {
      // eslint-disable-next-line no-underscore-dangle
      return res.status(201).json({ status: true, id: res.data._id });
    }
    return res.status(500).json({ status: false, error: Constant.labelList.serverError });
  },
  getByIdResponse: async (req, res) => {
    if (res.data) {
      return res.status(200).json(res.data);
    }
    return res.status(404).json({ status: true, message: Constant.labelList.invalidInput });
  },
  getAllResponse: async (req, res) => {
    if (res.data) {
      return res.status(200).json(res.data);
    }
    return res.status(500).json({ status: false, error: Constant.labelList.serverError });
  },
  updateResponse: async (req, res) => {
    if (res.data) {
      if (res.data.nModified === 1) {
        return res.status(200).json({ status: true, message: Constant.labelList.updateSuccess });
      }
      if (res.data.nModified === -1) {
        return res.status(200).json({ status: true, message: res.data.message });
      }
      return res.status(404).json({ status: false, message: Constant.labelList.invalidInput });
    }
    return res.status(500).json({ status: false, error: Constant.labelList.serverError });
  },
  deleteResponse: async (req, res) => {
    if (res.data) {
      // eslint-disable-next-line no-underscore-dangle
      if (res.data.deletedCount === 1 || res.data._id != null) {
        return res.status(200).json({ status: true, message: Constant.labelList.deleteSuccess });
      } if (res.data.deletedCount > 1) {
        return res.status(200).json({ status: true, message: Constant.labelList.deleteSuccess });
      }
      return res.status(404).json({ status: true, message: Constant.labelList.invalidInput });
    }
    /* if (res.error) {
      if (res.error) {
        if (res.error.name === Constant.errorName.castError) {
          return res.status(500).json({ status: false, error: Constant.labelList.invalidInput });
        }
        return res.status(500).json({ status: false, error: Constant.labelList.serverError });
      }
    } */
    return Constant.labelList.default;
  },
  stripeWebhookResponse: async (req, res) => res.status(200).json({ received: true }),
  consumerResponse: async (req, res) => {
    if (res.data) {
      return res.status(200).json(res.data);
    }
    return res.status(500).json({ status: false, error: Constant.labelList.serverError });
  },
};
module.exports = ResponseMiddleWare;
