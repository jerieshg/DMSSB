let Job = require('../models/Job');
let Client = require('../models/Client');

module.exports.readAll = function(req, res, next) {
  Job.find({}, function(error, jobs) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(jobs);
  });
}

module.exports.create = function(req, res, next) {
  let job = new Job(req.body);

  job.save(function(error, job) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(job);
  });
}

module.exports.update = function(req, res, next) {
  Job.findOne({
    _id: req.params.id
  }, function(error, job) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    let previosJob = job.job;

    for (prop in req.body) {
      job[prop] = req.body[prop];
    }

    job.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      Client.update({
          job: previosJob
        }, {
          $set: {
            job: job.job
          }
        }, {
          "multi": true
        },
        function(error, result) {
          if (error) {
            res.status(500);
            next(error);
            return res.send(error);
          }

          res.json(job);
        })
    });
  });
}

module.exports.delete = function(req, res, next) {
  Job.remove({
    _id: req.params.id
  }, function(error, job) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(job);
  });
}

module.exports.find = function(req, res, next) {
  Job.findOne({
    _id: req.params.id
  }, function(error, job) {
    if (error) {
      res.status(500);
      next(error);
      return res.send(error);
    }

    res.json(job);
  });
}
