'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Service', {
  service: String,
  department: String,
  created: Date
});
