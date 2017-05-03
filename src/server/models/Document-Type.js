'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  type: {
    type: String,
    unique: true
  },
  code: String,
  flow: {},
  blueprint: Boolean,
  isProcessOrManual: Boolean,
  requiresSGIA: Boolean,
  created: Date
})

module.exports = mongoose.model('Document-Type', schema);
