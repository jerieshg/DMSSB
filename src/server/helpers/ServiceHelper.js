module.exports = function(router) {

  let Service = require('../models/Service');

  router.route('/api/services/')
    .get(function(req, res) {
      Service.find({}, function(error, service) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(service);
      });
    })
    .post(function(req, res) {
      let service = new Service(req.body);

      service.save(function(error, service) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(service._id);
      });
    });

  router.route('/api/services/:id')
    .put(function(req, res) {
      Service.findOne({
        _id: req.params.id
      }, function(err, service) {
        if (err) {
          res.status(500);
          return res.send(err);
        }

        for (prop in req.body) {
          service[prop] = req.body[prop];
        }

        service.save(function(err) {
          if (err) {
            res.status(500);
            return res.send(err);
          }

          res.json({
            message: 'Service updated!'
          });
        });
      });
    })
    .delete(function(req, res) {
      Service.remove({
        _id: req.params.id
      }, function(error, service) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json({
          message: 'Successfully deleted'
        });
      });
    });

  router.route('/api/services/:id').get(function(req, res) {
    Service.findOne({
      _id: req.params.id
    }, function(error, service) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(service);
    });
  });
  router.route('/api/services/:dept/department/').get(function(req, res) {
    Service.find({
      department: req.params.dept
    }, function(error, services) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(services);
    });
  });
};
