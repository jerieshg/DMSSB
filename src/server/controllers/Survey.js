  let Survey = require('../models/Survey.js');
  let SurveyResponse = require('../models/SurveyResponse');
  let Client = require('../models/Client');
  var ObjectId = require('mongoose').Types.ObjectId;

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

        res.json(survey);
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

  module.exports.trackResponses = function(req, res, next) {
    Survey.distinct("questions.clients", {
      _id: req.params.id
    }, function(error, surveyClients) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      SurveyResponse.aggregate(
        [{
          $match: {
            surveyId: new ObjectId('58a47fd0df5a5e12ac438eb2')
          }
        }, {
          $group: {
            _id: '$job',
            count: {
              $sum: 1
            }
          }
        }],
        function(error, surveyResponses) {
          if (error) {
            res.status(500);
            next(error);
            return res.send(error);
          }

          Client.aggregate(
            [{
              $group: {
                _id: '$job',
                count: {
                  $sum: 1
                }
              }
            }],
            function(error, clients) {
              if (error) {
                res.status(500);
                next(error);
                return res.send(error);
              }

              let data = {
                responses: []
              };
              let responsesCount = [];
              let totalCountHolder = [];
              surveyResponses.forEach(e => {
                responsesCount[e._id] = e.count;
              });

              clients.forEach(e => {
                totalCountHolder[e._id] = e.count;
              });

              surveyClients.forEach(function(n) {
                data.responses.push({
                  _id: n,
                  current: responsesCount[n] ? responsesCount[n] : 0,
                  total: totalCountHolder[n] ? totalCountHolder[n] : 0
                })
              });

              data.currentTotal = data.responses.map(e => e.current).reduce((a, b) => a + b, 0);
              data.total = data.responses.map(e => e.total).reduce((a, b) => a + b, 0);
              res.json(data);
            });
        });

    });
  }
