'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  system: {
    type: String,
    unique: true
  },
  implications: [],
  created: Date
})

module.exports = mongoose.model('System', schema);
