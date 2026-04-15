const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
  mbid: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['single', 'EP', 'LP'],
    required: true
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);