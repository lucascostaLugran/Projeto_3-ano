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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);