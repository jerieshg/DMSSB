'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  service: String,
  department: String,
  created: Date
})

module.exports = mongoose.model('Service', schema);
