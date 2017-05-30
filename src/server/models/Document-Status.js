'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  status: {
    type: String,
    unique: true
  },
  created: Date
})

module.exports = mongoose.model('Document-Status', schema);
