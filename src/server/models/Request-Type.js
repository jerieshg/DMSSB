'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  type: {
    type: String,
    unique: true
  },
  hide: Boolean,
  created: Date
})

module.exports = mongoose.model('Request-Type', schema);
