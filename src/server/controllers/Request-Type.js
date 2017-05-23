let RequestType = require('../models/Request-Type');

module.exports.readAll = function(req, res, next) {
  RequestType.find({}, function(error, types) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(types);
  });
}

module.exports.create = function(req, res, next) {
  let docType = new RequestType(req.body);

  docType.save(function(error, type) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(type);
  });
}

module.exports.update = function(req, res, next) {
  RequestType.findOne({
    _id: req.params.id
  }, function(error, type) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      type[prop] = req.body[prop];
    }

    type.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(type);
    });
  });
}

module.exports.delete = function(req, res, next) {
  RequestType.remove({
    _id: req.params.id
  }, function(error, type) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(type);
  });
}

module.exports.find = function(req, res, next) {
  RequestType.findOne({
    _id: req.params.id
  }, function(error, type) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(type);
  });
}
