'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Business', {
  business: String,
  created: Date
});
