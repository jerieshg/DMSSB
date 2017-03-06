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
    }
  }

});
