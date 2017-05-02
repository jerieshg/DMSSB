let Document = require('../models/Document');
let Client = require('../models/Client');
let path = require("path");
let randomstring = require("randomstring");
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

module.exports.create = function(req, res, next) {
  let doc = new Document(req.body.document);
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

module.exports.delete = function(req, res, next) {
  Document.findOne({
    _id: req.params.id
  }, function(error, removeDoc) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    removeDoc.remove(function(error, doc) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      if (removeDoc.files.length > 0) {
        //retrieves first folder path and deletes the whole folder
        let folderPath = removeDoc.files[0].path.replace(removeDoc.files[0].fileName, "");
        fse.removeSync(folderPath);
      }

      res.json(removeDoc);
    });
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
      'flow.published': false,
      business: client.business
    }, function(error, docs) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      docs.filter((doc) => {
        if (doc.type.blueprint && !e.flow.blueprintApproved) {
          return e.implication.authorized.map(a => a.user._id).includes(req.params.id);
        } else if (doc.type.isProcessOrManual) {

        } else {

        }
      })

      res.json(docs);
    });


  });
  //Get USer ID
  //Get Department
  // Load documents as per type.flow and if that person already approved it or not
  // let isQuality = (req.params.quality && req.params.quality === "true") ? true : false;
  // let isSGIA = (req.params.SGIA && req.params.SGIA === "true") ? true : false;

  // if (isSGIA) {
  //   Document.find({
  //     'requiresSGIA': true,
  //     'flow.published': false,
  //     'flow.revisionBySGIA': true,
  //     'flow.approvedByQuality': true,
  //     'flow.prepForPublication': false
  //   }, function(error, docs) {
  //     if (error) {
  //       res.status(500);
  //       next(error);
  //       return res.send(error);
  //     }

  //     res.json(docs);
  //   });
  // } else if (isQuality) {
  //   Document.find({
  //     $and: [{
  //       'flow.published': false,
  //     }, {
  //       $or: [{
  //         'flow.prepForPublication': true
  //       }, {
  //         'flow.approvedByQuality': false
  //       }]
  //     }]
  //   }, function(error, docs) {
  //     if (error) {
  //       res.status(500);
  //       next(error);
  //       return res.send(error);
  //     }

  //     res.json(docs);
  //   });
  // } else {
  //   Document.find({
  //     'flow.published': false,
  //     // 'type.blueprint': true,
  //     // 'flow.blueprintApproved': false
  //   }, function(error, docs) {
  //     if (error) {
  //       res.status(500);
  //       next(error);
  //       return res.send(error);
  //     }

  //     let dept = new Buffer(req.params.dept, 'binary').toString('utf8');
  //     let job = new Buffer(req.params.job, 'binary').toString('utf8');

  //     docs = docs.filter((e) => {
  //       if (e.type.blueprint && !e.flow.blueprintApproved && e.type.authorized.length > 0) {
  //         return e.type.authorized.map(a => a.user._id).includes(req.params.id);
  //       }
  //       7

  //       return (e.type.hasProcessOwner && e.department === dept && job.toUpperCase().includes('JEFE') && !e.approvedByProcessOwner);
  //     });

  //     docs = docs.filter((e) => {
  //       let approvals = e.approvals.filter((e) => e.forBlueprint && !e.approved);
  //       return !approvals.map(a => a.user._id).includes(req.params.id);
  //     });

  //     res.json(docs);
  //   });
  // }
}

module.exports.updateApprovals = function(req, res, next) {
  Document.update({
    _id: req.params.id
  }, {
    $set: {
      approvals: req.body.approvals,
      status: req.body.status,
      flow: req.body.flow
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
