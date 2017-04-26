'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  code: {
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
  type: {
    type: {
      type: String
    },
    code: String,
    authorized: [{
      user: {
        _id: String,
        username: String,
      },
      priority: Number
    }],
    blueprint: Boolean,
    hasProcessOwner: Boolean,
    bossPriority: Boolean,
    created: Date
  },
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
  approvals: [{
    forBlueprint: Boolean,
    approved: Boolean,
    user: {},
    comment: String,
    created: Date
  }],
  flow: {
    approvedByQuality: Boolean,
    approvedBySGIA: Boolean,
    blueprintApproved: Boolean,
    revisionBySGIA: Boolean,
    approvedByProcessOwner: Boolean,
    prepForPublication: Boolean,
    published: Boolean
  },
  created: Date
})

module.exports = mongoose.model('Document', schema);
