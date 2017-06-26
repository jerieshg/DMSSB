let Document = require('../models/Document');
let DocumentHistory = require('../models/Document-History');

//Report thats retrieves all document that have been published in the selected month and returns days required to publish the document
module.exports.documentaryCenterReport = function(req, res, next) {
  DocumentHistory.aggregate([{
    $match: {}
  }, {
    $sort: {
      'history.created': -1
    }
  }, {
    $project: {
      docId: "$docId",
      history: {
        $filter: {
          input: '$history',
          as: 'item',
          cond: [{
            $eq: ['$$item.field', 'status']
          }, {
            $and: [{
              $gt: [
                '$$item.created', req.body.startDate
              ]
            }, {
              $lt: [
                '$$item.created', req.body.endDate
              ]
            }, {
              $eq: ['$$item.added', 'Publicado']
            }, {
              $eq: ['$$item.added', 'Listo para publicacion']
            }]
          }]

        }
      }
    }
  }], (error, documentHistories) => {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    let result = [];

    documentHistories.forEach((docHistory) => {
      let data = {
        docId: docHistory.docId,
      }

      data.published = docHistory.history.find(e => {
        return e.added === 'Publicado';
      });

      data.readyToPublish = docHistory.history.find(e => {
        return e.added === 'Listo para publicacion';
      });

      result.push(data);
    });

    Document.find({
      _id: {
        $in: result.map(e => e.docId)
      }
    }, (error, docs) => {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      let response = [];

      docs.forEach((doc) => {
        let history = result.find(e => e.docId.toString() === doc._id.toString());
        let daysDiff;

        if (doc.status === 'Publicado') {
          daysDiff = (doc.name, daysDifference(history.readyToPublish ? history.readyToPublish.created : doc.created, doc.publication.publicationDate));
        } else if (doc.status === 'Listo para publicacion') {
          daysDiff = (doc.name, daysDifference(history.readyToPublish ? history.readyToPublish.created : doc.created, new Date()));
        }

        if (daysDiff !== undefined) {
          response.push({
            daysDifference: daysDiff,
            document: doc,
            published: doc.publication.publicationDate,
            readyToPublish: history.readyToPublish ? history.readyToPublish.created : undefined
          });
        }
      });

      res.json(response);
    });
  });
}

function daysDifference(date1, date2) {
  dt1 = new Date(date1);
  dt2 = new Date(date2);
  return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
}
