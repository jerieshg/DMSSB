let passport = require('passport');
let mongoose = require('mongoose');
let Client = mongoose.model('Client');

module.exports.register = function(req, res) {
  let client = new Client(req.body);
  client.setPassword(req.body.password);

  client.save(function(error, client) {
    if (error) {
      res.status(500);
      return res.send(error);
    }

    let token = client.generateJwt();
    res.json({
      "token": token
    });
  });
};

module.exports.changePassword = function(req, res, next) {
  Client.findOne({
    _id: req.params.clientId
  }, function(error, client) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    if (client.validPassword(req.body.oldPassword)) {
      client.setPassword(req.body.newPassword);

      client.save(function(error) {
        if (error) {
          res.status(500);
          next(error);
          return res.send(error);
        }

        let token = client.generateJwt();
        res.json({
          "token": token
        });
      });
    } else {
      res.status(400).json("Invalid Old Password");
    }
  });
}

module.exports.login = function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err);
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        "token": token
      });
    } else {
      // If user is not found
      res.status(401).json(info);
    }
  })(req, res);

};
