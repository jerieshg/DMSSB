(function() {

  function email($http, commonFactory) {

    var sendRejectedEmail = function(name, docId) {
      return $http.get(`/api/email/clients/${name}/documents/${docId}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          return error;
        });
    };

    var sendDocumentReminder = function(docId, users) {
      return $http.post(`/api/email/documents/${docId}/document-reminder/`, {
          users: users
        })
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };


    return {
      sendRejectedEmail: sendRejectedEmail,
      sendDocumentReminder: sendDocumentReminder
    };
  }

  email.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('email', email);
})();
