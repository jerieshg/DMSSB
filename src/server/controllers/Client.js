let Client = require('../models/Client');

module.exports.readAll = function(req, res, next) {
  Client.find({}, function(error, clients) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    clients.sort((a, b) => {
      return (a.username < b.username) ? -1 : (a.username > b.username) ? 1 : 0;
    });


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
      if (req.body[prop].type === 'Buffer') {
        client[prop] = Buffer.from(req.body[prop].data);
      } else {
        client[prop] = req.body[prop];
      }
    }
    
    client.markModified('role');

    if (req.body.password) {
      client.setPassword(req.body.password);
    }

    client.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(client);
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

    res.json(client);
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
