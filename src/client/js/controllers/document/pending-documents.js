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

        let isQuality = (data && data.documentRevision) ? data.documentRevision : false;
        let isSGIA = (data && data.isSGIA) ? data.isSGIA : false;

        $http.get(`/api/documents/pending/${$rootScope.client._id}/quality/${isQuality}/SGIA/${isSGIA}/dept/${$rootScope.client.department}/job/${$rootScope.client.job}`)
          .then(function(response) {
            $scope.documents = response.data;
          })
          .catch(function(error) {
            console.log(error);
          });
      });
  }
}

PendingApprovalDocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'departments', 'documents'];
angular.module('app').controller('pendingApprovalDocumentController', PendingApprovalDocumentController);
