(function() {
  'use strict';
  emailCheck();

  function emailCheck() {
    //every 15 minutes
    var interval = 15 * 60 * 1000;

    setInterval(function() {
      console.log("I am doing my 15 minutes check");
      // do your stuff here
    }, interval);
  }

});
