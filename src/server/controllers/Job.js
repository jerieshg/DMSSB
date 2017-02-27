let Job = require('../models/Job');

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

    res.json(job._id);
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

    for (prop in req.body) {
      job[prop] = req.body[prop];
    }

    job.save(function(error) {
      if (error) {
        res.status(500);
        next(error);
        return res.send(error);
      }

      res.json({
        message: 'job updated!'
      });
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

    res.json({
      message: 'Successfully deleted'
    });
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
