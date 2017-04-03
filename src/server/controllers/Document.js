let Document = require('../models/Document');
let path = require("path");


module.exports.readAll = function(req, res, next) {
  Document.find({}, function(error, document) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(document);
  });
}

module.exports.create = function(req, res, next) {
  let doc = new Document(req.body.document);

  doc.created = new Date();

  req.files.forEach((e) => {
    doc.files.push({
      fileName: e.filename,
      path: e.path
    });
  });

  doc.save(function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(doc);
  });
}

module.exports.update = function(req, res, next) {
  Document.findOne({
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

      res.json(doc);
    });
  });
}

module.exports.delete = function(req, res, next) {
  Document.remove({
    _id: req.params.id
  }, function(error, docType) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(doc);
  });
}

module.exports.find = function(req, res, next) {
  Document.findOne({
    _id: req.params.id
  }, function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(doc);
  });
}

module.exports.findMyDocuments = function(req, res, next) {
  Document.find({
    'createdBy._id': req.params.id
  }, function(error, docs) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(docs);
  });
}

module.exports.findToAuthorizeDocuments = function(req, res, next) {

  Document.find({
    'type.authorized': {
      $elemMatch: {
        _id: req.params.id
      }
    }
  }, function(error, docs) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(docs);
  });
}

module.exports.downloadFile = function(req, res, next) {
  let file = unescape(req.params.path);

  let filename = path.basename(file);

  res.download(file, filename, (err) => {
    if (err) {
      console.log("ERROR:", err);
    }
  });
}
