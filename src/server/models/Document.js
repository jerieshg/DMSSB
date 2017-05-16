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
    step: String,
    approved: Boolean,
    user: {},
    comment: String,
    created: Date
  }],
  flow: {
    revisionBySGIA: Boolean,
    revisionBySGMA: Boolean,
    approvedByBoss: Boolean,
    approvedByQA: Boolean,
    approvedBySGIA: Boolean,
    approvedBySGMA: Boolean,
    approvedByManagement: Boolean,
    approvedByPrepForPublish: Boolean,
    blueprintApproved: Boolean,
    prepForPublication: Boolean,
    published: Boolean,
    deleted: Boolean
  },
  publication: {
    code: String,
    revision: String,
    publicationDate: Date
  },
  created: Date
})

module.exports = mongoose.model('Document', schema);
