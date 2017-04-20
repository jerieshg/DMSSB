function DocumentController($rootScope, $scope, $http, commonFactory, documents) {

  initializeController();

  $scope.deleteDocument = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este documento?")) {
      documents.delete(id)
        .then((data) => {
          retrieveMyDocuments();
        });
    }
  }

  function initializeController() {
    retrieveMyDocuments();
  }

  function retrieveMyDocuments() {
    $http.get(`/api/documents/clients/${$rootScope.client._id}`)
      .then(function(response) {
        $scope.documents = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

DocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'documents'];
angular.module('app').controller('documentController', DocumentController);
