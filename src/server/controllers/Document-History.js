let DocumentHistory = require('../models/Document-History');

module.exports.readAll = function(req, res, next) {
  DocumentHistory.find({}, function(error, documentsHistory) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentsHistory);
  });
}

module.exports.create = function(req, res, next) {
  let documentHistory = new DocumentHistory(req.body);

  documentHistory.save(function(error, documentHistory) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentHistory);
  });
}

module.exports.update = function(req, res, next) {
  DocumentHistory.findOne({
    docId: req.params.id
  }, function(error, documentHistory) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      documentHistory[prop] = req.body[prop];
    }

    documentHistory.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(documentHistory);
    });
  });
}

module.exports.delete = function(req, res, next) {
  DocumentHistory.remove({
    docId: req.params.id
  }, function(error, documentHistory) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentHistory);
  });
}

module.exports.find = function(req, res, next) {
  DocumentHistory.findOne({
    docId: req.params.id
  }, function(error, documentHistory) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentHistory);
  });
}
