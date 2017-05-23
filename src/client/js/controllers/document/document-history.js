function DocumentHistoryController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory) {

  initializeController();

  function initializeController() {
    $scope.selectedDocument = {};
    retrieveDocument();
    retrieveDocumentHistory();
  }

  $scope.translateField = function(field) {
    if (field === 'type') {
      return 'Tipo de documento';
    }
    if (field === 'version') {
      return 'Version';
    }
    if (field === 'name') {
      return 'Nombre';
    }
    if (field === 'requestedDate') {
      return 'Fecha Solicitada';
    }
    if (field === 'priority') {
      return 'Prioridad';
    }
    if (field === 'requiredDate') {
      return 'Fecha Requerida';
    }
    if (field === 'requester') {
      return 'Solicitante';
    }
    if (field === 'business') {
      return 'Planta';
    }
    if (field === 'department') {
      return 'Departamento';
    }
    if (field === 'expiredDate') {
      return 'Fecha de vencimiento';
    }
    if (field === 'active') {
      return 'Activo';
    }
    if (field === 'requiresSGIA') {
      return 'Requiere Revision SGIA';
    }
    if (field === 'implication') {
      return 'Implicacion';
    }
    if (field === 'status') {
      return 'Estado';
    }
    if (field === 'comments') {
      return 'Comentario';
    }
    if (field === 'files') {
      return 'archivo(s)';
    }
    if (field === 'approvals') {
      return 'aprobacion';
    }
    if (field === 'request') {
      return 'Tipo de solicitud';
    }

    return field;
  }

  $scope.retrieveValue = function(object) {
    if (object.list && object.value) {
      return (object.value > 0) ? 'agregado' : ' eliminado';
    }

    return '';
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
    $http.get(`/api/documents-history/${$stateParams.id}`)
      .then(function(response) {
        $scope.documentHistory = response.data;
        if (!$scope.documentHistory) {
          $scope.documentHistory = {
            new: true,
            history: []
          };
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

DocumentHistoryController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('documentHistoryController', DocumentHistoryController);
