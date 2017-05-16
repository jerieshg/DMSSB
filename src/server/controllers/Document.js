let Document = require('../models/Document');
let Client = require('../models/Client');
let path = require("path");
let randomstring = require("randomstring");
let fs = require("fs");
let fse = require("fs-extra");

module.exports.downloadFile = function(req, res, next) {
  let file = unescape(req.params.path);

  let filename = path.basename(file);

  res.download(file, filename, (err) => {
    if (err) {
      console.log("ERROR:", err);
    }
  });
}


module.exports.updateFiles = function(req, res, next) {
  let doc = new Document(req.body.document);

  req.files.forEach((e) => {
    doc.files.push({
      fileName: e.filename,
      path: e.path
    });
  });

  doc.files.forEach((e) => {
    delete e["$hashKey"];
  });

  Document.update({
    _id: doc._id
  }, {
    $set: {
      files: doc.files
    }
  }, function(error, result) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(doc);
  });
}

module.exports.create = function(req, res, next) {
  let doc = new Document(JSON.parse(req.body.document));
  doc.created = new Date();

  req.files.forEach((e) => {
    doc.files.push({
      fileName: e.filename,
      path: e.path
    });
  });

  let randomNumber = randomstring.generate({
    length: 5,
    charset: 'numeric'
  });

  doc.code = `${doc.type.code}-${randomNumber}`;


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
  }, function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (prop in req.body) {
      doc[prop] = req.body[prop];
    }

    doc.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json(doc);
    });
  });
}

module.exports.deleteFile = function(req, res, next) {
  Document.findOne({
    _id: req.params.id
  }, function(error, doc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    for (let i = 0; i < doc.files.length; i++) {
      if (doc.files[i].fileName === req.params.name) {
        let deletedFiles = doc.files.splice(i, 1);

        deletedFiles.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
    }

    Document.update({
      _id: doc._id
    }, {
      $set: {
        files: doc.files
      }
    }, function(error, result) {
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
  Document.update({
    _id: req.params.id
  }, {
    $set: {
      status: 'Anulado'
    }
  }, function(error, result) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(result);
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

module.exports.findPendingDocuments = function(req, res, next) {
  Client.findOne({
    _id: req.params.id
  }, function(error, client) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    Document.find({
      "flow.published": false,
      "status": {
        $ne: "Anulado"
      },
      business: {
        $in: client.business
      }
    }, function(error, docs) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      docs = docs.filter((doc) => {
        if (doc.type.blueprint && !doc.flow.blueprintApproved) {
          return doc.implication.authorization.map(a => a._id).includes(req.params.id);
        }

        let selectedFlow = doc.type.flow[doc.business];

        if (selectedFlow) {
          let sgia = selectedFlow.approvals.sgia;
          sgia = (sgia) ? sgia.map(e => e._id).includes(client._id.toString()) : false;

          let sgma = selectedFlow.approvals.sgma;
          sgma = (sgma) ? sgma.map(e => e._id).includes(client._id.toString()) : false;

          let qa = selectedFlow.approvals.qa;
          qa = (qa) ? qa.map(e => e._id).includes(client._id.toString()) : false;

          let deptBoss = (selectedFlow.approvals.deptBoss) ? selectedFlow.approvals.deptBoss[client.department] : false;
          deptBoss = (deptBoss) ? deptBoss.map((e) => e._id).includes(client._id.toString()) : false;

          let management = selectedFlow.approvals.management;
          management = (management) ? management.map(e => e._id).includes(client._id.toString()) : false;

          let prepForPublication = selectedFlow.approvals.prepForPublication;
          prepForPublication = (prepForPublication) ? prepForPublication.map(e => e._id).includes(client._id.toString()) : false;

          if (deptBoss && !doc.flow.approvedByBoss) {
            return true;
          } else if (management && !doc.flow.approvedByManagement && !doc.flow.prepForPublication) {
            return true;
          } else if (qa && !doc.flow.approvedByQA && (!doc.flow.prepForPublication || doc.flow.approvedByBoss)) {
            return true;
          } else if (doc.type.requiresSGIA && sgia && !doc.flow.approvedBySGIA && doc.flow.approvedByQA && !doc.flow.prepForPublication) {
            return true;
          } else if (sgma && doc.requiresSafetyEnv && doc.flow.approvedBySGIA && !doc.flow.approvedBySGMA && !doc.flow.prepForPublication) {
            return true;
          } else if (prepForPublication && doc.flow.prepForPublication) {
            return true;
          } else {
            return false;
          }
        }

        return false;
      })

      res.json(docs);
    });


  });
}

module.exports.updateApprovals = function(req, res, next) {
  Document.update({
    _id: req.params.id
  }, {
    $set: {
      approvals: req.body.approvals,
      status: req.body.status,
      flow: req.body.flow,
      publication: req.body.publication
    }
  }, function(error, result) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(result);
  });
}

module.exports.search = function(req, res, next) {

  for (var key of Object.keys(req.body)) {
    if (req.body[key] === '') {
      req.body[key] = null;
    }
  }

  Document.find({}, function(error, docs) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    if (req.body.code) {
      docs = docs.filter((doc) => {
        return doc.code.includes(req.body.code);
      });
    }
    if (req.body.name) {
      docs = docs.filter((doc) => {
        return doc.name.includes(req.body.name);
      })
    }
    if (req.body.status) {
      docs = docs.filter((doc) => {
        return doc.status === req.body.status;
      })
    }
    if (req.body.department) {
      docs = docs.filter((doc) => {
        return doc.department === req.body.department;
      })
    }
    if (req.body.business) {
      docs = docs.filter((doc) => {
        return doc.business === req.body.business;
      })
    }
    if (req.body.docType) {
      docs = docs.filter((doc) => {
        return doc.type.type === req.body.docType;
      })
    }

    res.json(docs);
  });
}
