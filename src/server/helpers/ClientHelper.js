module.exports = function(router) {

  let Client = require('../models/Client');

  router.route('/api/clients/')
    .get(function(req, res) {
      Client.find({}, function(error, clients) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(clients);
      });
    })
    .post(function(req, res) {
      let client = new Client(req.body);

      client.save(function(error, client) {
        if (error) {
          res.status(500);
          return res.send(error);
        }

        res.json(client._id);
      });
    });

  router.route('/api/clients/:id')
    .put(function(req, res) {
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
    })
    .delete(function(req, res) {
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
    });

  router.route('/api/clients/:id').get(function(req, res) {
    Client.findOne({
      _id: req.params.id
    }, function(error, client) {
      if (error) {
        res.status(500);
        return res.send(error);
      }

      res.json(client);
    });
  });
};
