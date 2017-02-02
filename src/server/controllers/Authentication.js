let passport = require('passport');
let mongoose = require('mongoose');
let Client = mongoose.model('Client');

module.exports.register = function(req, res) {
  var client = new Client();

  client.name = req.body.name;
  client.email = req.body.email;

  client.setPassword(req.body.password);

  client.save(function(err) {
    var token;
    token = client.generateJwt();
    res.status(200);
    res.json({
      "token": token
    });
  });
};

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
