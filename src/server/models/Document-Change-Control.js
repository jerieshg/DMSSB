'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  docId: mongoose.Schema.Types.ObjectId,
  changes: [{
    user: {
      _id: mongoose.Schema.Types.ObjectId,
      username: String
    },
    description: String,
    created: Date
  }],
  created: Date
})

module.exports = mongoose.model('Document-Change-Control', schema);
