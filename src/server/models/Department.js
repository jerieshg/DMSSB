'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  department: {
    type: String,
    unique: true
  },
  documentRevision: Boolean,
  created: Date
})

module.exports = mongoose.model('Department', schema);
