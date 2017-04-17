let SurveyResponse = require('../models/Survey-Response');
let mongoose = require('mongoose');

module.exports.readBySurveyId = function(req, res, next) {
  SurveyResponse.find({
    surveyId: req.params.id
  }, function(error, responses) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(responses);
  });
}

module.exports.readByClientId = function(req, res, next) {
  SurveyResponse.find({
      'client._id': req.params.clientId
    },
    function(error, responses) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(responses);
    });
}

module.exports.readByClientIdAndSurveyId = function(req, res, next) {
  SurveyResponse.findOne({
      'surveyId': req.params.id,
      'client._id': req.params.clientId
    },
    function(error, response) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(response);
    });
}

module.exports.createMany = function(req, res, next) {
  SurveyResponse.insertMany(req.body, function(error, responses) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(responses);
  });
}

module.exports.delete = function(req, res, next) {
  SurveyResponse.remove({
    surveyId: req.params.id
  }, function(error, survey) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(survey);
  });
}
