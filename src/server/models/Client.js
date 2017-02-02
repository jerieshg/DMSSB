'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Client', {

  username: String,
  password: String,
  role: {
    role: String,
    created: Date
  },
  created: Date
});
