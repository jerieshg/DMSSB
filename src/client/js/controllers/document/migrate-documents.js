function MigrateDocumentsController($rootScope, $scope, $http, Upload, commonFactory, documents) {

  initializeController();


  $scope.test1 = function(doc, files) {
    $scope.files = files;
    $scope.selectedDocument = doc;
  }

  $scope.retrieveToMigrateDoucments = function() {
    Upload.upload({
      method: 'POST',
      url: `/api/excel/migrate/`,
      data: {
        files: $scope.excel,
      }
    }).then(function(response) {
      console.log(response)
      if (response.status === 200) {
        $scope.convertedItems = response.data.data;
      } else {
        commonFactory.toastMessage('Por favor verique la intregidad de la data!', 'warning');
      }
    }, function(response) {
      if (response.status > 0) {
        $scope.errorMsg = response.status + ': ' + response.data;
      }
      commonFactory.toastMessage('Oops! Algo malo paso!', 'danger');
    }, function(evt) {

    });
  }

  $scope.saveFiles = function() {
    if ($scope.files && $scope.files.length) {

      let fileExtras = {};
      $scope.files.forEach((e) => {
        fileExtras[e.name] = {
          electronic: e.electronic
        }
      });

      Upload.upload({
        url: `/api/documents/`,
        data: {
          document: angular.toJson($scope.selectedDocument),
          extras: angular.toJson(fileExtras),
          files: $scope.files
        }
      }).then(function(response) {
        if (response.status === 200) {
          $scope.results[$scope.selectedDocument.name] = true;
          commonFactory.toastMessage('Documento salvado exitosamente!', 'success');
        } else {
          $scope.results[$scope.selectedDocument.name] = false;
        }
      }, function(response) {
        if (response.status > 0) {
          commonFactory.toastMessage('Algo paso! Porfavor contacte al administrador', 'danger');
          $scope.results[$scope.selectedDocument.name] = false;
        }
      }, function(evt) {});

      $('#filesModal').modal('toggle');
    }
  }

  function initializeController() {
    $scope.results = {};
  }
}

MigrateDocumentsController.$inject = ['$rootScope', '$scope', '$http', 'Upload', 'commonFactory', 'documents'];
angular.module('app', ['ngFileUpload']).controller('migrateDocumentsController', MigrateDocumentsController);
