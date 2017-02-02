module.exports = function(router) {

  let Business = require('../models/Business');

  router.route('/api/business/')
    .get(function(req, res) {
      Business.find({}, function(error, business) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(business);
      });
    })
    .post(function(req, res) {
      let business = new Business(req.body);

      business.save(function(error, business) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(business._id);
      });
    });

  router.route('/api/business/:id')
    .put(function(req, res) {
      Business.findOne({
        _id: req.params.id
      }, function(err, business) {
        if (err) {
          res.status(500);
          return res.send(err);
        }

        for (prop in req.body) {
          business[prop] = req.body[prop];
        }

        business.save(function(err) {
          if (err) {
            res.status(500);
            return res.send(err);
          }

          res.json({
            message: 'Business updated!'
          });
        });
      });
    })
    .delete(function(req, res) {
      Business.remove({
        _id: req.params.id
      }, function(error, business) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json({
          message: 'Successfully deleted'
        });
      });
    });

  router.route('/api/business/:id').get(function(req, res) {
    Business.findOne({
      _id: req.params.id
    }, function(error, business) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(business);
    });
  });
};
