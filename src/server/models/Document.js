'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  requestedDate: Date,
  priority: String,
  requiredDate: Date,
  business: String,
  department: String,
  type: {
    type: {
      type: String,
      unique: false
    },
    code: String,
    requests: {},
    blueprint: Boolean,
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
    step: Number,
    approved: Boolean,
    user: {},
    comment: String,
    created: Date
  }],
  request: {},
  flow: {
    blueprintApproved: Boolean,
    readyToPublish: Boolean,
    published: Boolean,
    deleted: Boolean
  },
  publication: {
    code: String,
    revision: Number,
    publicationDate: Date
  },
  created: Date
})

module.exports = mongoose.model('Document', schema);
