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
    flow: {},
    blueprint: Boolean,
    isProcessOrManual: Boolean,
    requiresSGIA: Boolean,
    created: Date
  },
  expiredDate: Date,
  active: Boolean,
  requiresSafetyEnv: Boolean,
  system: String,
  implication: {},
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
    revisionBySGIA: Boolean,
    approvedByBoss: Boolean,
    approvedByQA: Boolean,
    approvedBySGIA: Boolean,
    approvedByManagement: Boolean,
    approvedByPrepForPublish: Boolean,
    blueprintApproved: Boolean,
    prepForPublication: Boolean,
    published: Boolean
  },
  created: Date
})

module.exports = mongoose.model('Document', schema);
