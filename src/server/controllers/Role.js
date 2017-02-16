let Role = require('../models/Role');

module.exports.readAll = function(req, res, next) {
  Role.find({}, function(error, roles) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(roles);
  });
}

module.exports.create = function(req, res, next) {
  let role = new Role(req.body);

  role.save(function(error, role) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(role._id);
  });
}

module.exports.update = function(req, res, next) {
  Role.findOne({
    _id: req.params.id
  }, function(error, role) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      role[prop] = req.body[prop];
    }

    role.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json({
        message: 'Role updated!'
      });
    });
  });
}

module.exports.delete = function(req, res, next) {
  Role.remove({
    _id: req.params.id
  }, function(error, role) {
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
  Role.findOne({
    _id: req.params.id
  }, function(error, role) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(role);
  });
}
