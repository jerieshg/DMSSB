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
    departments.findByName($rootScope.client.department)
      .then((data) => {

        $http.get(`/api/documents/pending/${$rootScope.client._id}/quality/${(data && data.documentRevision) ? data.documentRevision : false}`)
          .then(function(response) {
            $scope.documents = response.data;
            console.log($scope.documents);
          })
          .catch(function(error) {
            console.log(error);
          });
      });
  }
}

PendingApprovalDocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'departments', 'documents'];
angular.module('app').controller('pendingApprovalDocumentController', PendingApprovalDocumentController);
