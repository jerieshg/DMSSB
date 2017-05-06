angular.module('app').factory('commonFactory', function($mdToast) {

  return {
    toastMessage: function(message, type) {
      $mdToast.show(
        $mdToast.simple()
        .textContent(message)
        .position('start right')
        .hideDelay(3000)
        .theme(type)
      );
    },
    activateAlert: function(message, alertType) {
      $('#alertArea').append('<div class="alert alert-' + alertType + ' alert-dismissible fade show" role="alert" id="alertArea" ><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + message + '</div>');

      $("#alertArea").fadeTo(3500, 500).slideUp(500, function() {
        $("#alertArea").slideUp(500);
        $(this).html("");
      });
    },

    generateNumber: function(min, max) {
      let c = [];

      for (var i = min; i <= max; i++) {
        c.push({
          label: i
        });
      }

      return c;
    },

    generateNumberArray: function(min, max) {
      let c = [];

      for (var i = min; i <= max; i++) {
        c.push(i);
      }

      return c;
    },

    randomString: function(length) {
      return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
    },

    indexInArray: function(array, name) {
      return array.map(function(item) {
        return item.name;
      }).indexOf(name);
    },

    groupBy: function(array, key) {
      return array.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    },

    dialog: function(message) {
      var open_time = new Date();
      var result = confirm(message);
      var close_time = new Date();

      if (close_time - open_time < 10) {
        return true;
      } else {
        return result;
      }
    },

    formatDate: function(date) {
      var day = date.getDate();
      var monthIndex = date.getMonth();
      var year = date.getFullYear();

      return monthIndex + '/' + day + '/' + year;
    },

    checkProperties: function(obj) {
      for (var key of Object.keys(obj)) {
        if (obj[key] !== null && obj[key] != "")
          return false;
      }

      return true;
    },

    removeDuplicates: function(arr, prop) {
      let uniqueArray = [];
      let lookup = {};

      arr.forEach((e) => {
        lookup[this.deepValue(e, prop)] = e;
      });

      Object.keys(lookup).forEach(function(key) {
        uniqueArray.push(lookup[key]);
      });

      return uniqueArray;
    },

    deepValue: function(obj, path) {
      for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
        obj = obj[path[i]];
      };

      return obj;
    }
  }

});
