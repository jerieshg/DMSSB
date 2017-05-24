function DocumentChangeControlController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory) {

  initializeController();

  function initializeController() {
    $scope.selectedDocument = {};
    retrieveDocument();
    retrieveDocumentHistory();
  }

  function retrieveDocument() {
    $http.get(`/api/documents/${$stateParams.id}`)
      .then(function(response) {
        $scope.selectedDocument = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDocumentHistory() {
    $http.get(`/api/documents-change-control/${$stateParams.id}`)
      .then(function(response) {
        $scope.documentChangeControl = response.data;
        if (!$scope.documentChangeControl) {
          $scope.documentChangeControl = {
            changes: []
          };
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

DocumentChangeControlController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('documentChangeControlController', DocumentChangeControlController);
