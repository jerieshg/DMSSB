'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  version: String,
  requestedDate: Date,
  priority: String,
  requiredDate: Date,
  requester: String,
  business: String,
  department: String,
  type: {},
  expiredDate: Date,
  active: Boolean,
  requiresSGIA: Boolean,
  system: String,
  implication: String,
  files: [],
  status: String,
  comments: String,
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId,
    username: String
  },
  created: Date
})

module.exports = mongoose.model('Document', schema);
