let Client = require('../models/Client');

module.exports.readAll = function(req, res) {
  Client.find({}, function(error, clients) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json(clients);
  });
}

module.exports.update = function(req, res) {
  Client.findOne({
    _id: req.params.id
  }, function(err, client) {
    if (err) {
      res.status(500);
      return res.send(err);
    }

    for (prop in req.body) {
      client[prop] = req.body[prop];
    }
    client.markModified('role');
    client.setPassword(req.body.password);

    client.save(function(err) {
      if (err) {
        res.status(500);
        return res.send(err);
      }

      res.json({
        message: 'Client updated!'
      });
    });
  });
}

module.exports.delete = function(req, res) {
  Client.remove({
    _id: req.params.id
  }, function(error, client) {
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
  Client.findOne({
    _id: req.params.id
  }, function(error, client) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    res.json(client);
  });
}
