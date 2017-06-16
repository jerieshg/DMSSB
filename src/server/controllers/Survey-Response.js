let SurveyResponse = require('../models/Survey-Response');
let Client = require('../models/Client');
let mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;

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

module.exports.findMissingClients = function(req, res, next) {
  let job = req.params.job;

  Client.find({
    job: job
  }, function(error, clients) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    SurveyResponse.find({
      surveyId: req.params.id
    }, function(error, responses) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      let jobResponses = responses.filter(e => {
        let responseJob = new Buffer(e.job, 'binary').toString('utf8');
        return job === responseJob;
      }).map(e => e.client._id);

      let remainingClients = clients.filter((client) => {
        return !jobResponses.includes(client._id.toString());
      });

      res.json(remainingClients);
    });
  });
}

module.exports.countSurveyResponses = function(req, res, next) {
  let ids = [];

  req.body.forEach(e => {
    ids.push(new ObjectId(e));
  });

  SurveyResponse.aggregate([{
    $match: {
      surveyId: {
        $in: ids
      }
    }
  }, {
    $group: {
      _id: '$surveyId',
      count: {
        $sum: 1
      }
    }
  }], function(error, count) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(count);
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
