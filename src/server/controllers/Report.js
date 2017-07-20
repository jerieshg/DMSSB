let Document = require('../models/Document');
let DocumentHistory = require('../models/Document-History');
let Client = require('../models/Client');
var ObjectId = require('mongoose').Types.ObjectId;

//Report thats retrieves all document that have been published in the selected month and returns days required to publish the document
module.exports.documentaryCenterReport = function(req, res, next) {
  Document.find({
    $or: [{
      "status": "Publicado"
    }, {
      "status": 'Listo para publicacion'
    }]
  }, (error, docs) => {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    docs = docs.filter(e => {
      if (e.status === 'Publicado') {
        return e.publication.publicationDate >= new Date(req.body.startDate) && e.publication.publicationDate <= new Date(req.body.endDate);
      }

      return true;
    });

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
              $or: [{
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

        docHistory.history = docHistory.history.filter((e) => {
          return e.created >= new Date(req.body.startDate) && e.created < new Date(req.body.endDate)
        });

        data.published = docHistory.history.find(e => {
          return e.added === 'Publicado';
        });

        data.readyToPublish = docHistory.history.find(e => {
          return e.added === 'Listo para publicacion';
        });

        result.push(data);
      });

      let response = [];
      let correct = 0;

      docs.forEach((doc) => {
        let history = result.find(e => e.docId.toString() === doc._id.toString());
        let daysDiff;
        let startDate = doc.created;
        if (history && history.readyToPublish) {
          startDate = history.readyToPublish.created;
        }

        if (history && doc.status === 'Publicado') {
          daysDiff = daysDifference(startDate, doc.publication.publicationDate);
        } else if (doc.status === 'Listo para publicacion') {
          daysDiff = daysDifference(startDate, new Date());
        }

        if (daysDiff !== undefined) {
          correct += (req.body.graceDays - daysDiff >= 0) ? 1 : 0;

          response.push({
            daysDifference: daysDiff,
            document: doc,
            published: doc.publication.publicationDate,
            readyToPublish: startDate
          });
        }
      });

      res.json({
        response: response,
        correctResponse: correct,
        grade: ((correct / response.length) * 100).toFixed(2)
      });
    });
  });
}

//Report thats retrieves all documentos that have been rejected in the selected dates and filter them by department so the department can be evaluated
module.exports.evaluateRejectedDocuments = function(req, res, next) {
  Document.find({
    "status": {
      $ne: "Publicado"
    }
  }, (error, docs) => {

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
        history: "$history"
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

        docHistory.history = docHistory.history.filter((e) => {
          return e.created >= new Date(req.body.startDate) && e.created < new Date(req.body.endDate)
        });

        let doc = docs.find(e => e._id.toString() === docHistory.docId.toString());
        if (doc.status.toLowerCase().includes('lista de aut')) {
          data.rejectedBlueprint = docHistory.history.find(e => {
            return e.field === 'approvals' && e.value.includes('false');
          });
        } else {
          data.rejected = docHistory.history.find(e => {
            return e && e.added && e.added.toLowerCase().includes('rechazado por');
          });

          data.changed = docHistory.history.find(e => {
            if (data.rejected && data.rejected.added) {
              return e && e.removed && e.removed.toLowerCase() === data.rejected.added.toLowerCase();
            }
          });
        }

        result.push(data);
      });


      //loop through each doc and check if the status changed..then ge the department in charged for that and BAM!
      // if its re
      let response = [];
      let promises = [];
      let correct = 0;
      let specificCorrectResponse = {};

      docs.forEach((doc) => {
        let resultHistory = result.find(e => e.docId.toString() === doc._id.toString());

        let startDate, endDate;
        let blueprint = false,
          currentStep = '';

        if (resultHistory) {
          if (resultHistory.rejectedBlueprint) {
            startDate = resultHistory.rejectedBlueprint.created;
            blueprint = true;
          } else if (resultHistory.rejected) {
            startDate = resultHistory.rejected.created;
            currentStep = resultHistory.rejected.added.split(" ");
            if (currentStep) {
              currentStep = currentStep.slice(2, currentStep.length).join(" ");
            }
          }
          endDate = resultHistory.changed;
        }

        if (!startDate)
          return;


        if (!endDate) {
          endDate = new Date();
        } else if (startDate && endDate.created > startDate) {
          endDate = endDate.created;
        }

        let daysDiff = daysDifference(startDate, endDate);

        if (daysDiff !== undefined && !isNaN(daysDiff)) {
          let users = findUsers(doc, blueprint, currentStep);

          promises.push(
            retrieveUsersPromise(doc.name, users.map(e => {
              return new ObjectId(e._id);
            }))
          );

          correct += (req.body.graceDays - daysDiff >= 0) ? 1 : 0;;
          response.push({
            daysDifference: daysDiff,
            document: doc
          });
        }
      });

      Promise.all(promises).then(values => {

        let departmentFiltered = {};

        values.forEach(value => {
          let docName = value.map(e => e.name)[0].join(" ").toLowerCase();

          let currentResponse = response.find(e => {
            return e.document.name.toLowerCase() === docName;
          });

          value.forEach(user => {
            if (!departmentFiltered[user._id]) {
              departmentFiltered[user._id] = {
                correct: 0,
                total: 0,
                users: user.userIds,
                response: []
              }
            }

            let approved = currentResponse.document.approvals.find(e => {
              return user.userIds.includes(e.user._id.toString()) && e.approved
            })

            if (approved) {
              departmentFiltered[user._id].correct += 1;
            } else {
              departmentFiltered[user._id].correct += (req.body.graceDays - currentResponse.daysDifference >= 0) ? 1 : 0;
            }

            departmentFiltered[user._id].response.push(currentResponse);
            departmentFiltered[user._id].total += 1;
            departmentFiltered[user._id].grade = ((departmentFiltered[user._id].correct / departmentFiltered[user._id].total) * 100).toFixed(2);
          });

        });

        res.json({
          response: response,
          correctResponse: correct,
          grade: (correct / response.length) * 100,
          departmentFiltered: departmentFiltered
        });
      });
    });
  });
}

//Report thats retrieves all document that have been published in the selected month and returns days required to publish the document
module.exports.evaluateDocumentsUnderReview = function(req, res, next) {
  Document.find({
    $and: [{
      "status": {
        $ne: "Publicado"
      }
    }, {
      "status": {
        $regex: ".*En rev.*"
      }
    }]

  }, (error, docs) => {

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
        history: '$history'
      }
    }], (error, documentHistories) => {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      let response = [];
      let promises = [];
      let correct = 0;

      docs.forEach((doc) => {
        let resultHistory = documentHistories.find((e) => {
          return doc._id.toString() === e.docId.toString();
        });

        let startDate, endDate;
        let blueprint = false,
          currentStep = '';

        if (resultHistory) {
          resultHistory = retrieveDocHistory(resultHistory, doc.status, req.body.startDate, req.body.endDate);
          if (resultHistory.blueprintHistory) {
            startDate = resultHistory.blueprintHistory.created;
            blueprint = true;
          } else if (resultHistory.changed) {
            startDate = resultHistory.changed.created;
            currentStep = resultHistory.changed.added.split(" ");
            if (currentStep) {
              currentStep = currentStep.slice(2, currentStep.length).join(" ");
            }
          }

          endDate = resultHistory.movementAfterDate;
        } else {
          startDate = doc.requestedDate;
        }

        if (!startDate)
          return;


        if (!endDate) {
          endDate = new Date();
        } else if (startDate && endDate.created > startDate) {
          endDate = endDate.created;
        }

        let daysDiff = daysDifference(startDate, endDate);

        if (daysDiff !== undefined && !isNaN(daysDiff)) {
          let users = findUsers(doc, blueprint, currentStep);

          users = users ? users.map(e => {
            return new ObjectId(e._id);
          }) : [];

          promises.push(
            retrieveUsersPromise(doc.name, users)
          );

          correct += (req.body.graceDays - daysDiff >= 0) ? 1 : 0;;
          response.push({
            daysDifference: daysDiff,
            document: doc
          });
        }
      });

      Promise.all(promises).then(values => {

        let departmentFiltered = {};

        values.forEach(value => {
          let docName = value.map(e => e.name)[0].join(" ").toLowerCase();

          let currentResponse = response.find(e => {
            return e.document.name.toLowerCase() === docName;
          });

          value.forEach(user => {
            if (!departmentFiltered[user._id]) {
              departmentFiltered[user._id] = {
                correct: 0,
                total: 0,
                users: user.userIds,
                response: []
              }
            }

            let approved = currentResponse.document.approvals.find(e => {
              return user.userIds.includes(e.user._id.toString()) && e.approved
            })

            if (approved) {
              departmentFiltered[user._id].correct += 1;
            } else {
              departmentFiltered[user._id].correct += (req.body.graceDays - currentResponse.daysDifference >= 0) ? 1 : 0;
            }

            departmentFiltered[user._id].response.push(currentResponse);
            departmentFiltered[user._id].total += 1;
            departmentFiltered[user._id].grade = ((departmentFiltered[user._id].correct / departmentFiltered[user._id].total) * 100).toFixed(2);
          });

        });

        res.json({
          response: response,
          correctResponse: correct,
          grade: ((correct / response.length) * 100).toFixed(2),
          departmentFiltered: departmentFiltered
        });
      });
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
      let correct = 0;

      docs.forEach((doc) => {
        let docHistory = documentHistories.find(e => e.docId.toString() === doc._id.toString());

        if (doc.history) {
          docHistory.history = docHistory.history.filter((e) => {
            return e.created >= new Date(req.body.startDate) && e.created < new Date(req.body.endDate)
          });
        }

        let startDate = docHistory ? docHistory.history.find((e) => {
          if (e.added) {
            return e.added.toLowerCase().includes(req.body.step.toLowerCase());
          }
        }) : null;

        if (!startDate) {
          if (doc.status.toLowerCase().includes(req.body.step.toLowerCase())) {
            startDate = doc.requestedDate;
          }
        } else {
          startDate = startDate.created;
        }

        let endDate = docHistory ? docHistory.history.find((e) => {
          if (e.removed) {
            return e.removed.toLowerCase().includes(req.body.step.toLowerCase());
          }
        }) : null;

        if (!endDate || doc.status.toLowerCase().includes(req.body.step.toLowerCase())) {
          endDate = new Date();
        } else if (startDate && endDate.created > startDate) {
          endDate = endDate.created;
        }

        let daysDiff = daysDifference(startDate, endDate);

        if (daysDiff !== undefined && !isNaN(daysDiff)) {
          correct += (req.body.graceDays - daysDiff >= 0) ? 1 : 0;
          response.push({
            daysDifference: daysDiff,
            document: doc
          });
        }
      });

      res.json({
        response: response,
        correctResponse: correct,
        grade: ((correct / response.length) * 100).toFixed(2)
      });
    });
  });
}

//Report thats returns all the documents that are about to expire
module.exports.evaluateExpiredDocuments = function(req, res, next) {
  Document.find({
    expiredDate: {
      $ne: null
    },
    "flow.published": true
  }, (error, docs) => {
    let result = [];

    let aboutToExpireDocs = docs.filter((doc, index) => {
      let expiredDate = new Date(doc.expiredDate);
      let today = new Date();

      var utc1 = Date.UTC(expiredDate.getFullYear(), expiredDate.getMonth(), expiredDate.getDate());
      var utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

      let difference = Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));

      docs[index].daysDifference = difference;
      return difference <= 60;
    });

    let departmentFiltered = {};

    aboutToExpireDocs.forEach((doc) => {

      if (!departmentFiltered[doc.department]) {
        departmentFiltered[doc.department] = {
          correct: 0,
          total: 0,
          response: []
        }
      }
      // departmentFiltered[doc.department].correct += (req.body.graceDays - currentResponse.daysDifference >= 0) ? 1 : 0;
      if (doc.daysDifference > 31) {
        departmentFiltered[doc.department].correct += 1;
      }

      departmentFiltered[doc.department].response.push({
        document: doc
      });
      departmentFiltered[doc.department].total += 1;
      departmentFiltered[doc.department].grade = ((departmentFiltered[doc.department].correct / departmentFiltered[doc.department].total) * 100).toFixed(2);
    });

    res.json({
      departmentFiltered: departmentFiltered
    });
  });
}

function retrieveDocHistory(docHistory, status, startDate, endDate) {
  let data = {};

  docHistory.history = docHistory.history.filter((e) => {
    return e.created >= new Date(startDate) && e.created < new Date(endDate)
  });

  let regex = new RegExp("(?:por)\s*([^\n\r]*)", "g");
  status = regex.exec(status);

  if (status === null) {
    return;
  }

  status = status[0].replace("por ", "");

  if (status.toLowerCase().includes('lista de aut')) {
    data.blueprintHistory = docHistory.history.find(e => {
      return e.field === 'approvals';
    });
  } else {
    //grabs the history when the status was changed to the current one
    data.changed = docHistory.history.find((e) => {
      return e && e.added && e.added.toLowerCase().includes(`${status.toLowerCase()}`);
    });

    //check if there has been any movement after it was changed to that status
    data.movementAfterDate = docHistory.history.find((e) => {
      if (!data.changed || !e.created)
        return;

      return new Date(e.created).toISOString().split('.')[0] + "Z" > new Date(data.changed.created).toISOString().split('.')[0] + "Z";
    });
  }

  return data;
}

function findUsers(doc, blueprint, currentStep) {
  let users;

  if (blueprint) {
    let implication = doc.implication;
    let auths = implication ? implication.authorization : {};
    users = auths[doc.business];
  } else {
    let request = doc.request;

    if (request && currentStep) {
      let steps = request[doc.business] ? request[doc.business] : null;

      if (steps) {
        let step = steps.find((e) => {
          return e.name.toLowerCase().includes(currentStep.toLowerCase());
        });

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

  return users;
}

function retrieveUsersPromise(docName, ids) {
  if (ids.length > 0) {
    return Client.aggregate([{
      $match: {
        _id: {
          $in: ids
        }
      }
    }, {
      $group: {
        _id: '$department',
        userIds: {
          $addToSet: '$_id'
        },
        name: {
          $addToSet: docName
        }
      }
    }]).exec();
  } else {
    return Client.aggregate([{
      $match: {
        documentaryCenterAdmin: true
      }
    }, {
      $group: {
        _id: '$department',
        userIds: {
          $addToSet: '$_id'
        },
        name: {
          $addToSet: docName
        }
      }
    }]).exec();
  }
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
