let Client = require('../models/Client');

module.exports.readAll = function(req, res, next) {
  Client.find({}, function(error, clients) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(clients);
  });
}

module.exports.update = function(req, res, next) {
  Client.findOne({
    _id: req.params.id
  }, function(error, client) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      client[prop] = req.body[prop];
    }
    client.markModified('role');
    client.setPassword(req.body.password);

    client.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json({
        message: 'Client updated!'
      });
    });
  });
}

module.exports.delete = function(req, res, next) {
  Client.remove({
    _id: req.params.id
  }, function(error, client) {
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
  Client.findOne({
    _id: req.params.id
  }, function(error, client) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(client);
  });
}
