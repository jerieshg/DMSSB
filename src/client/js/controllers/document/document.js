function DocumentController($rootScope, $scope, $http, commonFactory) {

  initializeController();

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

DocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory'];
angular.module('app').controller('documentController', DocumentController);
