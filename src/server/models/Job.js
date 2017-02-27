'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Job', {
  job: String,
  created: Date
});
