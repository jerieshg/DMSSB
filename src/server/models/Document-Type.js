'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  type: {
    type: String,
    unique: true
  },
  code: String,
  authorized: [{
    id: mongoose.Schema.Types.ObjectId,
    priority: Number
  }],
  blueprint: Boolean,
  bossPriorty: Boolean,
  created: Date
})

module.exports = mongoose.model('Document-Type', schema);
