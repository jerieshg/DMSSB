module.exports = function(router) {

  let Survey = require('../models/Survey.js');

  router.route('/api/surveys/')
    .get(function(req, res) {
      Survey.find({}, function(error, surveys) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(surveys);
      });
    })
    .post(function(req, res) {
      let survey = new Survey(req.body);

      survey.save(function(error, survey) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(survey._id);
      });
    });

  router.route('/api/surveys/:id')
    .put(function(req, res) {
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
    })
    .delete(function(req, res) {
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
    });

  router.route('/api/surveys/:id').get(function(req, res) {
    Survey.findOne({
      _id: req.params.id
    }, function(error, survey) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(survey);
    });
  });
  router.route('/api/surveys/:client/client').get(function(req, res) {
    Survey.findOne({
      questions: {
        $elemMatch: {
          clients: [req.params.client]
        }
      }
    }, function(error, survey) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(survey);
    });
  });
};
