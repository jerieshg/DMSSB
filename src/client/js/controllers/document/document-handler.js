function DocumentHandlerController($rootScope, $scope, $http, Upload, commonFactory) {

  initializeController();

  $scope.saveDocument = function() {
    if ($scope.files && $scope.files.length) {

      if ($scope.selectedDocument.type.blueprint) {
        $scope.selectedDocument.status = "Pendiente autorizaciones";
      } else {
        
        if ($scope.selectedDocument.type.bossPriority && $rootScope.client.department.toUpperCase().includes('JEFE')) {
          if ($scope.selectedDocument.requiresSGIA) {
            $scope.selectedDocument.flow.revisionBySGIA = true;
            $scope.selectedDocument.status = "En revision por SGIA";
          } else {
            $scope.selectedDocument.flow.prepForPublication = true;
            $scope.selectedDocument.status = "Preparado para publicacion";
          }
        } else {
          $scope.selectedDocument.status = "En revision por Calidad";
        }
      }

      delete $scope.selectedDocument.type["$$hashKey"];

      $scope.selectedDocument.createdBy = {
        _id: $rootScope.client._id,
        username: $rootScope.client.username
      };

      Upload.upload({
        url: `/api/documents/${$scope.selectedDocument.name}`,
        data: {
          files: $scope.files,
          document: $scope.selectedDocument
        }
      }).then(function(response) {
        console.log(response);
      }, function(response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
        }
      }, function(evt) {
        $scope.progress =
          Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });

      //sends email
    } else {
      commonFactory.toastMessage("No se ha adjuntado un archivo!", "danger");
    }
  };

  $scope.retrieveImplications = function() {
    if ($scope.systems) {
      let filteredImplications = $scope.systems.filter(e => e.system === $scope.selectedDocument.system);

      return (filteredImplications.length > 0) ? filteredImplications[0].implications : [];
    }

    return null;
  }

  function initializeController() {
    $(".datepicker input").datepicker({});
    $scope.selectedDocument = {
      status: "Nuevo",
      flow: {
        approvedByQuality: false,
        approvedBySGIA: false,
        blueprintApproved: false,
        revisionBySGIA: false,
        prepForPublication: false,
        published: false
      }
    };
    $scope.priorities = ["Alta", "Normal", "Bajo"];
    retrieveBusiness();
    retrieveClients();
    retrieveDepartments();
    retrieveDocTypes();
    retrieveSystems();
  }

  function retrieveBusiness() {
    $http.get('/api/business/')
      .then(function(response) {
        $scope.business = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveClients() {
    $http.get('/api/clients/')
      .then(function(response) {
        $scope.clients = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDepartments() {
    $http.get('/api/departments/')
      .then(function(response) {
        $scope.departments = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDocTypes() {
    $http.get('/api/document-types/')
      .then(function(response) {
        $scope.docTypes = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveSystems() {
    $http.get('/api/systems/')
      .then(function(response) {
        $scope.systems = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

DocumentHandlerController.$inject = ['$rootScope', '$scope', '$http', 'Upload', 'commonFactory'];
angular.module('app', ['ngFileUpload']).controller('documentHandlerController', DocumentHandlerController);
