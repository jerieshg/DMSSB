'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  surveyId: mongoose.Schema.Types.ObjectId,
  job: String,
  results: [{
    service: String,
    question: String,
    formType: String,
    answer: String,
    value: String,
    rates: [Number]
  }],
  client: {},
  timestamp: Date,
})

module.exports = mongoose.model('Survey-Response', schema);
