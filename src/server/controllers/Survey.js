  let Survey = require('../models/Survey.js');

  module.exports.readAll = function(req, res) {
    Survey.find({}, function(error, surveys) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(surveys);
    });
  }

  module.exports.create = function(req, res) {
    let survey = new Survey(req.body);

    survey.save(function(error, survey) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(survey._id);
    });
  }

  module.exports.update = function(req, res) {
    Survey.findOne({
      _id: req.params.id
    }, function(err, survey) {
      if (err) {
        res.status(500);
        return res.send(err);
      }

      for (prop in req.body) {
        survey[prop] = req.body[prop];
      }

      survey.save(function(err) {
        if (err) {
          res.status(500);
          return res.send(err);
        }

        res.json({
          message: 'Survey updated!'
        });
      });
    });
  }

  module.exports.delete = function(req, res) {
    Survey.remove({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json({
        message: 'Successfully deleted'
      });
    });
  }

  module.exports.find = function(req, res) {
    Survey.findOne({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(survey);
    });
  }

  module.exports.findByClient = function(req, res) {
    let client = req.params.client;
    Survey.find({
      questions: {
        $elemMatch: {
          clients: [client]
        }
      }
    }, function(error, surveys) {
      if (error) {
        res.status(500);
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

  module.exports.findbyClientAndId = function(req, res) {
    Survey.findOne({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      survey.questions = survey.questions.filter(question => question.clients.includes(req.params.client));

      res.json(survey);
    });
  }
