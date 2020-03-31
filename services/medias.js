/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const httpContext = require('express-http-context');
const debug = require('debug')('grammi-api:services/venues');
// const validator = require('validator');
// const crypto = require('crypto');
// const moment = require('moment-timezone');
const uuid = require('node-uuid');
const createError = require('http-errors');
const request = require('request');

const AWS = require('aws-sdk');
const config = require('../config/config');
// const Medias = require('../models/medias');
const Constant = require('../utilities/constant');

AWS.config.update({
  accessKeyId: config.api.AWSAccessKeyId,
  secretAccessKey: config.api.AWSSecretKey,
  signature: 'v4',
  region: 'us-east-2',
});
const s3 = new AWS.S3();
const s3Stream = require('s3-upload-stream')(new AWS.S3());

const MediaService = {
  generateUploadPolicy: (MediaData) => new Promise((resolve, reject) => {
    const { mimeType } = MediaData;
    const key = `${uuid.v4()}_${MediaData.fileName}`;
    let errorRes;
    const params = {
      Bucket: config.api.bucketName,
      Conditions: [
        ['content-length-range', 0, config.api.S3FileUploadLimit],
        { bucket: config.api.bucketName },
        { acl: 'public-read' },
        ['starts-with', '$Content-Type', mimeType],
      ],
      Fields: {
        key,
      },
    };
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        debug(`Error on Presigning post data encountered an error ${err}`, httpContext.get('requestId'));
        errorRes = createError(err.status, Constant.labelList.invalidFile);
        reject(errorRes);
      } else {
        resolve(data);
      }
    });
  }),
  uploadS3: () => new Promise((resolve, reject) => {
    const param = {};
    param.opt = {
      method: 'GET',
      url: 'https://res.cloudinary.com/demo/image/upload/seagull.jpg', // test image
      headers: {
        Accept: 'image/*',
      },
    };
    const d = Date.now();
    const upload = s3Stream.upload({
      Bucket: config.api.bucketName,
      Key: `test${d}.jpeg`,
      ACL: 'public-read',
      ContentType: 'image/jpeg',
    });
    request(param.opt)
      .on('response', (response) => {
        debug(`Response for upload s3 ${response.statusCode}`, httpContext.get('requestId'));
        debug(`Response headers for upload s3 ${response.headers['content-type']}`, httpContext.get('requestId'));
      })
      .on('error', (err) => {
        debug(`Error uploading in upload s3 ${JSON.stringify(err)}`, httpContext.get('requestId'));
        reject(err);
      })
      .pipe(upload)
      .on('uploaded', (details) => {
        debug(`Image s3 upload location ${details.Location}`, httpContext.get('requestId'));
        resolve(details.Location);
      });
  }),

};

module.exports = MediaService;
