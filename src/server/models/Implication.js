'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  implication: {
    type: String,
    unique: true
  },
  created: Date
})

module.exports = mongoose.model('Implication', schema);
