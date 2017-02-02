'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Role', {
  role: String,
  created: Date
});
