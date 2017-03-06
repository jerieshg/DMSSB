'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Survey-Response', {
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
});
