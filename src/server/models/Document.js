'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  name: {
    type: String,
    unique: false
  },
  fileUUID: String,
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
    requests: {},
    blueprint: Boolean,
    created: Date
  },
  periodExpirationTime: Number,
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
  migrated: Boolean,
  request: {},
  flow: {
    blueprintApproved: Boolean,
    readyToPublish: Boolean,
    published: Boolean,
    deleted: Boolean
  },
  timeStored: Number,
  publication: {
    code: String,
    revision: Number,
    publicationDate: Date
  },
  created: Date
})

module.exports = mongoose.model('Document', schema);
