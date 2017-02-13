'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Role', {
  role: String,
  level: Number,
  created: Date
});
