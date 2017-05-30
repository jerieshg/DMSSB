function DocumentStatusController($scope, $http, commonFactory, documentStatus) {

  initializeController();

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.new = function() {
    $scope.selectedDocumentStatus = {};
  }

  $scope.save = function() {
    if ($scope.selectedDocumentStatus.edit) {
      documentStatus.update($scope.selectedDocumentStatus)
        .then((data) => {
          $scope.selectedDocumentStatus = {};
          retrieveDocumentStatus();
        });
    } else {
      $scope.selectedDocumentStatus.created = new Date();
      documentStatus.save($scope.selectedDocumentStatus)
        .then((data) => {
          $scope.selectedDocumentStatus = {};
          retrieveDocumentStatus();
        });
    }
  }

  $scope.update = function(id) {
    documentStatus.find(id)
      .then((data) => {
        $scope.selectedDocumentStatus = data;
        $scope.selectedDocumentStatus.edit = true;
      })
  }

  $scope.delete = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este estado? Puede afectar algun flujo en un futuro.")) {
      documentStatus.delete(id)
        .then((data) => {
          retrieveDocumentStatus();
          $scope.selectedDocumentStatus = {};
        })
    }
  }

  function initializeController() {
    $scope.selectedDocumentStatus = {};
    retrieveDocumentStatus();
  }

  function retrieveDocumentStatus() {
    documentStatus.readAll()
      .then((data) => {
        $scope.documentStatuses = data;
      })
  }
}

DocumentStatusController.$inject = ['$scope', '$http', 'commonFactory', 'documentStatus'];
angular.module('app').controller('documentStatusController', DocumentStatusController);
