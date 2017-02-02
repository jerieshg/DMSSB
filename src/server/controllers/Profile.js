let mongoose = require('mongoose');
let Client = mongoose.model('Client');

module.exports.readProfile = function(req, res) {
  // If no client ID exists in the JWT return a 401
  if (!req.payload._id) {
    res.status(401).json({
      "message": "UnauthorizedError: private profile"
    });
  } else {
    // Otherwise continue
    Client
      .findById(req.payload._id)
      .exec(function(err, client) {
        res.status(200).json(client);
      });
  }
};
