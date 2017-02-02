module.exports = function(router) {

  let Department = require('../models/Department');

  router.route('/api/departments/')
    .get(function(req, res) {
      Department.find({}, function(error, departments) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(departments);
      });
    })
    .post(function(req, res) {
      let department = new Department(req.body);

      department.save(function(error, department) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(department._id);
      });
    });

  router.route('/api/departments/:id')
    .put(function(req, res) {
      Department.findOne({
        _id: req.params.id
      }, function(err, department) {
        if (err) {
          res.status(500);
          return res.send(err);
        }

        for (prop in req.body) {
          department[prop] = req.body[prop];
        }

        department.save(function(err) {
          if (err) {
            res.status(500);
            return res.send(err);
          }

          res.json({
            message: 'Department updated!'
          });
        });
      });
    })
    .delete(function(req, res) {
      Department.remove({
        _id: req.params.id
      }, function(error, department) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json({
          message: 'Successfully deleted'
        });
      });
    });

  router.route('/api/departments/:id').get(function(req, res) {
    Department.findOne({
      _id: req.params.id
    }, function(error, department) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(department);
    });
  });
};
