let Service = require('../models/Service');

module.exports.readAll = function(req, res, next) {
  Service.find({}, function(error, service) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(service);
  });
}

module.exports.create = function(req, res, next) {
  let service = new Service(req.body);

  service.save(function(error, service) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(service._id);
  });
}

module.exports.update = function(req, res, next) {
  Service.findOne({
    _id: req.params.id
  }, function(error, service) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      service[prop] = req.body[prop];
    }

    service.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json({
        message: 'Service updated!'
      });
    });
  });
}

module.exports.delete = function(req, res, next) {
  Service.remove({
    _id: req.params.id
  }, function(error, service) {
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
  Service.findOne({
    _id: req.params.id
  }, function(error, service) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(service);
  });
}

module.exports.findByDepartment = function(req, res, next) {
  Service.find({
    department: req.params.dept
  }, function(error, services) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(services);
  });
}
