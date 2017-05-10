(function() {

  function email($http, commonFactory) {

    var sendRejectedEmail = function(name, docId) {
      return $http.get(`/api/email/clients/${name}/documents/${docId}`)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    };


    return {
      sendRejectedEmail: sendRejectedEmail
    };
  }

  email.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('email', email);
})();
