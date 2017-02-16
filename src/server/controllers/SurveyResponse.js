let SurveyResponse = require('../models/SurveyResponse');
let mongoose = require('mongoose');

module.exports.readBySurveyId = function(req, res) {
  SurveyResponse.find({
    surveyId: req.params.id
  }, function(error, responses) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json(responses);
  });
}

module.exports.createMany = function(req, res) {
  SurveyResponse.insertMany(req.body, function(error, responses) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json("OK");
  });
}
