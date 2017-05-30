'use strict'
var mongoose = require('mongoose');

let schema = new mongoose.Schema({
  surveyName: String,
  business: [String],
  department: String,
  period: {
    start: Date,
    end: Date
  },
  responsible: String,
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
  uniqueResponses: Boolean,
  finalGrade: Number,
  active: Boolean,
  general: Boolean,
  created: Date
})

module.exports = mongoose.model('Survey', schema);
