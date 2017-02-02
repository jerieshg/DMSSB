module.exports = function(router) {

  let Role = require('../models/Role');

  router.route('/api/roles/')
    .get(function(req, res) {
      Role.find({}, function(error, roles) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(roles);
      });
    })
    .post(function(req, res) {
      let role = new Role(req.body);

      role.save(function(error, role) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(role._id);
      });
    });

  router.route('/api/roles/:id')
    .put(function(req, res) {
      Role.findOne({
        _id: req.params.id
      }, function(err, role) {
        if (err) {
          res.status(500);
          return res.send(err);
        }

        for (prop in req.body) {
          role[prop] = req.body[prop];
        }

        role.save(function(err) {
          if (err) {
            res.status(500);
            return res.send(err);
          }

          res.json({
            message: 'Role updated!'
          });
        });
      });
    })
    .delete(function(req, res) {
      Role.remove({
        _id: req.params.id
      }, function(error, role) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json({
          message: 'Successfully deleted'
        });
      });
    });

  router.route('/api/roles/:id').get(function(req, res) {
    Role.findOne({
      _id: req.params.id
    }, function(error, role) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(role);
    });
  });
};
