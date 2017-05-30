let DocumentStatus = require('../models/Document-Status');

module.exports.readAll = function(req, res, next) {
  DocumentStatus.find({}, function(error, documentStatuses) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    documentStatuses.sort((a, b) => {
      return (a.status < b.status) ? -1 : (a.status > b.status) ? 1 : 0;
    });

    res.json(documentStatuses);
  });
}

module.exports.create = function(req, res, next) {
  let documentStatus = new DocumentStatus(req.body);

  documentStatus.save(function(error, documentStatus) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentStatus);
  });
}

module.exports.update = function(req, res, next) {
  DocumentStatus.findOne({
    _id: req.params.id
  }, function(error, documentStatus) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }


    for (prop in req.body) {
      documentStatus[prop] = req.body[prop];
    }

    documentStatus.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(documentStatus);
    });
  });
}

module.exports.delete = function(req, res, next) {
  DocumentStatus.remove({
    _id: req.params.id
  }, function(error, documentStatus) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentStatus);
  });
}

module.exports.find = function(req, res, next) {
  DocumentStatus.findOne({
    _id: req.params.id
  }, function(error, documentStatus) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentStatus);
  });
}
