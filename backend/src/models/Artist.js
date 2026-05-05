const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  isni: {
    type: String,
    required: true,
    unique: true,
    match: /^[0-9]{16}$/
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  startYear: {
    type: Number,
    required: true,
    min: 0
  },
  description: {         
    type: String,
    default: ""
  },
  imageUrl: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Artist', artistSchema);