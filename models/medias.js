const mongoose = require('mongoose');

const MediasModel = () => {
  const MediasSchema = new mongoose.Schema({
    url: { type: String, required: true },
    key: { type: String }, // File key returned from s3
  }, { timestamps: { createdAt: 'createdDate', updatedAt: 'modifedDate' } });
  return mongoose.model('medias', MediasSchema);
};

module.exports = MediasModel();
