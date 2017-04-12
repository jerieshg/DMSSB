let _System = require('../models/System');

module.exports.readAll = function(req, res, next) {
  _System.find({}, function(error, systems) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(systems);
  });
}

module.exports.create = function(req, res, next) {
  let system = new _System(req.body);

  system.save(function(error, system) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(system);
  });
}

module.exports.update = function(req, res, next) {
  _System.findOne({
    _id: req.params.id
  }, function(error, system) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      system[prop] = req.body[prop];
    }

    system.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(system);
    });
  });
}

module.exports.delete = function(req, res, next) {
  _System.remove({
    _id: req.params.id
  }, function(error, system) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(system);
  });
}

module.exports.find = function(req, res, next) {
  _System.findOne({
    _id: req.params.id
  }, function(error, system) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(system);
  });
}
