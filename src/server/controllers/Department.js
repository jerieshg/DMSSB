let Department = require('../models/Department');
let Service = require('../models/Service');

module.exports.readAll = function(req, res, next) {
  Department.find({}, function(error, departments) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(departments);
  });
}

module.exports.create = function(req, res, next) {
  let department = new Department(req.body);

  department.save(function(error, department) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(department._id);
  });
}

module.exports.update = function(req, res, next) {
  Department.findOne({
    _id: req.params.id
  }, function(error, department) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    let previousDept = department.department;

    for (prop in req.body) {
      department[prop] = req.body[prop];
    }

    department.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      Service.update({
          department: previousDept
        }, {
          $set: {
            department: department.department
          }
        }, {
          "multi": true
        },
        function(error, result) {
          if (error) {
            res.status(500);
            next(error);
            return res.send(error);
          }

          res.json({
            message: 'Department updated!'
          });
        })
    });
  });
}

module.exports.delete = function(req, res, next) {
  Department.remove({
    _id: req.params.id
  }, function(error, department) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json({
      message: 'Successfully deleted'
    });
  });
}

module.exports.find = function(req, res, next) {
  Department.findOne({
    _id: req.params.id
  }, function(error, department) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(department);
  });
}
