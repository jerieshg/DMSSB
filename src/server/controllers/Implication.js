let Implication = require('../models/Implication');
let _System = require('../models/System');

module.exports.readAll = function(req, res, next) {
  Implication.find({}, function(error, implication) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(implication);
  });
}

module.exports.create = function(req, res, next) {
  let implication = new Implication(req.body);

  implication.save(function(error, implication) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(implication);
  });
}

module.exports.update = function(req, res, next) {
  Implication.findOne({
    _id: req.params.id
  }, function(error, implication) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    let previousImpl = implication.implication;

    for (prop in req.body) {
      implication[prop] = req.body[prop];
    }

    implication.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }


      _System.update({
          implications: previousImpl
        }, {
          $set: {
            'implications.$': implication.implication
          }
        }, {
          "multi": true
        },
        function(error, result) {
          if (error) {
            res.status(500);
            next(error);
            return res.send(error);
          }

        })

      res.json(implication);
    });
  });
}

module.exports.delete = function(req, res, next) {
  Implication.remove({
    _id: req.params.id
  }, function(error, implication) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(implication);
  });
}

module.exports.find = function(req, res, next) {
  Implication.findOne({
    _id: req.params.id
  }, function(error, implication) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(implication);
  });
}
