'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  role: {
    type: String,
    unique: true
  },
  level: Number,
  created: Date
})

module.exports = mongoose.model('Role', schema);
