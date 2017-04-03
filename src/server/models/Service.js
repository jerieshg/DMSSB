'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  service: {
    type: String,
    unique: true
  },
  department: String,
  created: Date
})

module.exports = mongoose.model('Service', schema);
