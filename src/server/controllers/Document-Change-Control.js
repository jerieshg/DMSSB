let DocumentChangeControl = require('../models/Document-Change-Control');

module.exports.readAll = function(req, res, next) {
  DocumentChangeControl.find({}, function(error, documentsChangeControl) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentsChangeControl);
  });
}

module.exports.create = function(req, res, next) {
  let documentChangeControl = new DocumentChangeControl(req.body);

  documentChangeControl.save(function(error, documentChangeControl) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentChangeControl);
  });
}

module.exports.update = function(req, res, next) {
  DocumentChangeControl.findOne({
    docId: req.params.id
  }, function(error, documentChangeControl) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      documentChangeControl[prop] = req.body[prop];
    }

    documentChangeControl.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(documentChangeControl);
    });
  });
}

module.exports.delete = function(req, res, next) {
  DocumentChangeControl.remove({
    docId: req.params.id
  }, function(error, documentChangeControl) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentChangeControl);
  });
}

module.exports.find = function(req, res, next) {
  DocumentChangeControl.findOne({
    docId: req.params.id
  }, function(error, documentChangeControl) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(documentChangeControl);
  });
}
