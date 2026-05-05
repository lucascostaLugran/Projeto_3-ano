const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  title: { type: String, required: true },
  duration: { type: Number, required: true }
});

const versionSchema = new mongoose.Schema({
  ean13: { 
    type: String, 
    required: true, 
    match: /^\d{13}$/
  },
  format: { 
    type: String, 
    enum: ['CD', 'vinil', 'cassete'], 
    required: true 
  },
  description: { type: String, default: "" }
});


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
  },
  imageUrl: { 
    type: String, 
    default: ""
  },
  tracks: [trackSchema],
  versions: [versionSchema]

}, { timestamps: true });

module.exports = mongoose.model('Album', albumSchema);