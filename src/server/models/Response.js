'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Response', {
  timestamp: Date,
  question: String,
  answer: {
    name: String,
    value: Number
  }
});
