// const debug = require('debug')('grammi-api:controllers/medias');
require('express-async-errors');
const ModelService = require('../services/modelService');
const Constant = require('../utilities/constant');
const mediasModel = require('../models/medias');
const Medias = require('../services/medias');

const mediasService = new ModelService(mediasModel);
const MediasApi = {
  generateUploadPolicy: async (req, res) => {
    try {
      const mediaRes = await Medias.generateUploadPolicy(req.body);
      if (mediaRes) {
        return res.status(200).json({ status: true, policysiganture: mediaRes });
      }
    } catch (error) {
      return res.status(500).json({ status: false, Error: error.message });
    }
    return Constant.labelList.default;
  },
  uploadFile: async (req, res) => {
    try {
      const mediaRes = await Medias.uploadS3(req.body);
      if (mediaRes) {
        return res.status(200).json({ status: true, policysiganture: mediaRes });
      }
    } catch (error) {
      return res.status(500).json({ status: false, Error: error.message });
    }
    return Constant.labelList.default;
  },
  saveMedia: async (req, res, next) => {
    res.data = await mediasService.save(req.body);
    if (res.data) {
      next();
    } else {
      throw new Error();
    }
  },
  getMedia: async (req, res, next) => {
    const mediasRes = await mediasService.getById(req.params.mediaId);
    if (mediasRes) {
      const response = { status: true, medias: mediasRes };
      res.data = response;
      next();
    } else {
      throw new Error();
    }
  },
  updateMedia: async (req, res, next) => {
    const obj = { Id: req.params.mediaId, data: req.body, options: { runValidators: true } };
    res.data = await mediasService.update(obj);
    if (res.data) {
      next();
    } else {
      throw new Error();
    }
  },
  deleteMedia: async (req, res, next) => {
    res.data = await mediasService.deleteRemove(req.params.mediaId);
    if (res.data) {
      next();
    } else {
      throw new Error();
    }
  },
};
module.exports = MediasApi;
