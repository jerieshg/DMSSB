'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  job: {
    type: String,
    unique: true
  },
  created: Date
})

module.exports = mongoose.model('Job', schema);
