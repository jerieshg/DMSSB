  let Survey = require('../models/Survey.js');
  let SurveyResponse = require('../models/SurveyResponse');

  module.exports.readAll = function(req, res, next) {
    Survey.find({}, function(error, surveys) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(surveys);
    });
  }

  module.exports.create = function(req, res, next) {
    let survey = new Survey(req.body);

    survey.save(function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(survey._id);
    });
  }

  module.exports.update = function(req, res, next) {
    Survey.findOne({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      for (prop in req.body) {
        survey[prop] = req.body[prop];
      }
      survey.markModified('questions');
      survey.save(function(error) {
        if (error) {
          res.status(500);
          next(error);
          return res.send(error);
        }

        res.json({
          message: 'Survey updated!'
        });
      });
    });
  }

  module.exports.delete = function(req, res, next) {
    Survey.remove({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      SurveyResponse.remove({
        surveyId: req.params.id
      }, function(ex, surveyResponse) {
        if (error) {
          res.status(500);
          next(error);
          return res.send(error);
        }

      })

      res.json({
        message: 'Successfully deleted'
      });
    });
  }

  module.exports.find = function(req, res, next) {
    Survey.findOne({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(survey);
    });
  }

  module.exports.findByClient = function(req, res, next) {
    let client = req.params.client;
    Survey.find({
      $or: [{
        questions: {
          $elemMatch: {
            clients: client
          }
        }
      }, {
        general: true
      }]
    }, function(error, surveys) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      surveys.forEach(survey => {
        survey.questions = survey.questions
          .filter(question => question.clients.includes(client))
          .map(question => {
            question.type = question.formType;
            return question;
          });
      });

      res.json(surveys);
    });

  }

  module.exports.findbyClientAndId = function(req, res, next) {
    Survey.findOne({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      if (!survey.general) {
        survey.questions = survey.questions.filter(question => question.clients.includes(req.params.client));
      }

      res.json(survey);
    });
  }

  module.exports.findByDepartment = function(req, res, next) {
    Survey.find({
      department: req.params.dept
    }, function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }


      res.json(survey);
    });
  }

  module.exports.findbyDeptAndId = function(req, res, next) {
    Survey.findOne({
      _id: req.params.id,
      department: req.params.dept
    }, function(error, survey) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(survey);
    });
  }
