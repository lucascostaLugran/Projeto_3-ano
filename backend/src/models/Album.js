const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true
  },

  title: {
    type: String,
    required: true
  },

  duration: {
    type: Number,
    required: true
  }

  

}, { _id: false });

const versionSchema = new mongoose.Schema({
  ean13: {
    type: String,
    match: /^\d{13}$/
  },

  format: {
    type: String,
    enum: ['CD', 'Vinyl', 'Cassette']
  },

  description: {
    type: String,
    default: ""
  }

}, { _id: false });

const albumSchema = new mongoose.Schema({

  spotifyId: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  year: {
    type: Number,
    required: true
  },

  type: {
    type: String,
    enum: ['album', 'single', 'compilation'],
    required: true
  },
  

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true
  },
  mbid: {
    type: String,
    default: ""
  },

  

  imageUrl: {
    type: String,
    default: ""
  },

  tracks: [trackSchema],

  versions: {
    type: [versionSchema],
    default: []
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Album', albumSchema);