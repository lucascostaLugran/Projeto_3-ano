const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album',
    required: true
  },

  ean13: {
    type: String,
    required: true,
    match: /^\d{13}$/
  },

  format: {
    type: String,
    enum: ['CD', 'Vinyl', 'Cassette'],
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ['em análise', 'aceite', 'recusado'],
    default: 'em análise'
  }

}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);