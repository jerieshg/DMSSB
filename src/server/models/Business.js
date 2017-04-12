'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  business: {
    type: String,
    unique: true
  },
  created: Date
})

module.exports = mongoose.model('Business', schema);
