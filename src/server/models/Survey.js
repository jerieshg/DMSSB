'use strict'
var mongoose = require('mongoose');

module.exports = mongoose.model('Survey', {
  surveyName: String,
  business: String,
  department: String,
  period: {
    start: Date,
    end: Date
  },
  responsible: String,
  clients: [String],
  questions: [{
    name: String,
    title: String,
    formType: String,
    isRequired: Boolean,
    inputType: String,
    choices: [String],
    clients: [String],
    service: String,
    mininumRateDescription: String,
    maximumRateDescription: String,
    choicesValue: [{
      name: String,
      value: Number
    }],
    rateValues: [Number],
    showChoices: Boolean,
    created: Date
  }],
  active: Boolean,
  general: Boolean,
  created: Date
});
