const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9]+$/,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  birthDate: {
    type: Date,
    required: true
  },
  favoriteArtist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    default: null
  },
  collection: [{
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    ean13: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
  }],
  lists: [{
    name: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true
    },
    albums: [{
      album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
      addedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);