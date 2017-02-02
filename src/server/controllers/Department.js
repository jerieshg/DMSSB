let Department = require('../models/Department');

module.exports.readAll = function(req, res) {
  Department.find({}, function(error, departments) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json(departments);
  });
}

module.exports.create = function(req, res) {
  let department = new Department(req.body);

  department.save(function(error, department) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json(department._id);
  });
}

module.exports.update = function(req, res) {
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
}

module.exports.delete = function(req, res) {
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
}

module.exports.find = function(req, res) {
  Department.findOne({
    _id: req.params.id
  }, function(error, department) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json(department);
  });
}
