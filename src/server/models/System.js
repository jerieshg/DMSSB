'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  system: {
    type: String,
    unique: true
  },
  implications: [{
    implication: String,
    authorization: [{
      _id: mongoose.Schema.Types.ObjectId,
      username: String
    }]
  }],
  created: Date
})

module.exports = mongoose.model('System', schema);
