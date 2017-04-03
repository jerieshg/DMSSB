let DocumentType = require('../models/Document-Type');

module.exports.readAll = function(req, res, next) {
  DocumentType.find({}, function(error, documentTypes) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentTypes);
  });
}

module.exports.create = function(req, res, next) {
  let docType = new DocumentType(req.body);

  docType.save(function(error, docType) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(docType);
  });
}

module.exports.update = function(req, res, next) {
  DocumentType.findOne({
    _id: req.params.id
  }, function(error, docType) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      docType[prop] = req.body[prop];
    }

    docType.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json({
        message: 'DocumentType updated!'
      });
    });
  });
}

module.exports.delete = function(req, res, next) {
  DocumentType.remove({
    _id: req.params.id
  }, function(error, docType) {
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
  DocumentType.findOne({
    _id: req.params.id
  }, function(error, docType) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(docType);
  });
}
