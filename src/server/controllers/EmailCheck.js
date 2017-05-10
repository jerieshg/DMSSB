'use strict';

module.exports.emailExpirationCheck = (function() {

  let Email = require('./Email');
  let schedule = require('node-schedule');

  var cron = schedule.scheduleJob('0 0 1 * *', () => {
    Email.expiredDocumentCheck();
  });
});
