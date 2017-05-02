function PendingApprovalDocumentController($rootScope, $scope, $http, commonFactory, departments, documents) {

  initializeController();

  function initializeController() {
    retrievePendingDocuments();
  }

  $scope.deleteDocument = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este documento?")) {
      documents.delete(id)
        .then((data) => {
          retrievePendingDocuments();
        });
    }
  }

  function retrievePendingDocuments() {
    $http.get(`/api/documents/pending/${$rootScope.client._id}/`)
      .then(function(response) {
        $scope.documents = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

PendingApprovalDocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'departments', 'documents'];
angular.module('app').controller('pendingApprovalDocumentController', PendingApprovalDocumentController);
