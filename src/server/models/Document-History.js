'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  docId: mongoose.Schema.Types.ObjectId,
  history: [{
    user: String,
    field: String,
    added: String,
    removed: String,
    list: Boolean,
    value: String,
    created: Date
  }],
  created: Date
})

module.exports = mongoose.model('Document-History', schema);
