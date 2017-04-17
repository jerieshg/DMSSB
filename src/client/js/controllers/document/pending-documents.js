function PendingApprovalDocumentController($rootScope, $scope, $http, commonFactory) {

  initializeController();

  function initializeController() {
    retrievePendingDocuments();
  }

  function retrievePendingDocuments() {
    $http.get(`/api/documents/pending/${$rootScope.client._id}/quality/true`)
      .then(function(response) {

        $scope.documents = response.data;
        console.log($scope.documents);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

PendingApprovalDocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory'];
angular.module('app').controller('pendingApprovalDocumentController', PendingApprovalDocumentController);
