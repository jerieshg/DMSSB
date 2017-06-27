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
          daysDiff = daysDifference(history.readyToPublish ? history.readyToPublish.created : doc.created, doc.publication.publicationDate);
        } else if (doc.status === 'Listo para publicacion') {
          daysDiff = daysDifference(history.readyToPublish ? history.readyToPublish.created : doc.created, new Date());
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

//Report thats retrieves all document that have been published in the selected month and returns days required to publish the document
module.exports.rejectedDocumentsReport = function(req, res, next) {
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
            $and: [{
              $gt: [
                '$$item.created', req.body.startDate
              ]
            }, {
              $lt: [
                '$$item.created', req.body.endDate
              ]
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

      data.rejected = docHistory.history.find(e => {
        return e.added.includes('Rechazado');
      });

      data.changed = docHistory.history.find(e => {
        return e.added.includes('En revision');
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
          daysDiff = daysDifference(history.readyToPublish ? history.readyToPublish.created : doc.created, doc.publication.publicationDate);
        } else if (doc.status === 'Listo para publicacion') {
          daysDiff = daysDifference(history.readyToPublish ? history.readyToPublish.created : doc.created, new Date());
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

//Evaluate one step (approvalStepName) of a specific document type and depending in the request type 
module.exports.evaluateRequestStepReport = function(req, res, next) {
  Document.find({
    'type.type': req.body.type.type,
    'request.key': req.body.request,
  }, (error, docs) => {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    DocumentHistory.aggregate([{
      $match: {
        docId: {
          $in: docs.map(e => e._id)
        }
      }
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

      let response = [];
      docs.forEach((doc) => {
        let docHistory = documentHistories.find(e => e.docId.toString() === doc._id.toString());

        let startDate = docHistory ? docHistory.history.find((e) => {
          let status = `En revision por ${req.body.step}`;
          return e.added ? e.added.toLowerCase() : e.added === status.toLowerCase();
        }) : null;

        if (!startDate) {
          startDate = doc.requestedDate;
        } else {
          startDate = startDate.created;
        }

        //1. Get Users from current step
        //2. Call api to get the department
        //3. Group by department
        //4. Calculate 
        let users;
        if (req.body.step.toLowerCase() === 'lista de autorizaciones') {
          let implication = doc.implication;
          let auths = implication ? implication.authorization : {};
          users = auths[doc.business];
        } else {
          let request = doc.request;
          if (request) {
            let steps = request[doc.business] ? request[doc.business] : null;
            if (steps) {
              let step = steps.find((e) => {
                return e.name.toLowerCase() === req.body.step.toLowerCase();
              });
              console.log(step);
              if (step) {
                if (step.requiresDept) {
                  users = step.approvals[doc.department];
                } else {
                  users = step.approvals;
                }
              }
            }
          }
        }


        let daysDiff = daysDifference(startDate, new Date());
        if (daysDiff !== undefined) {
          response.push({
            daysDifference: daysDiff,
            document: doc,
            users: users
          });
        }
      });

      res.json(response);
    });
  });
}

function daysDifference(date1, date2) {
  let startDate = new Date(date1);
  let endDate = new Date(date2);

  // Validate input
  if (endDate < startDate)
    return 0;

  // Calculate days between dates
  let millisecondsPerDay = 86400 * 1000; // Day in milliseconds
  startDate.setHours(0, 0, 0, 1); // Start just after midnight
  endDate.setHours(23, 59, 59, 999); // End just before midnight
  let diff = endDate - startDate; // Milliseconds between datetime objects    
  let days = Math.ceil(diff / millisecondsPerDay);

  // Subtract two weekend days for every week in between
  let weeks = Math.floor(days / 7);
  days = days - (weeks * 2);

  // Handle special cases
  let startDay = startDate.getDay();
  let endDay = endDate.getDay();

  // Remove weekend not previously removed.   
  if (startDay - endDay > 1)
    days = days - 2;

  // Remove start day if span starts on Sunday but ends before Saturday
  if (startDay == 0 && endDay != 6)
    days = days - 1

  // Remove end day if span ends on Saturday but starts after Sunday
  if (endDay == 6 && startDay != 0)
    days = days - 1

  return days;
}
