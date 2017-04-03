function DocTypesController($scope, $http, commonFactory) {

  initializeController();

  $scope.selectedDocType = {};

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newDocType = function() {
    $scope.selectedDocType = {
      authorized: []
    };
    $scope.selectedAuths = [{}];
    $scope.choices.number = 0;
  }

  $scope.saveDocType = function() {
    if ($scope.selectedDocType.blueprint) {

      for (let [index, value] of $scope.selectedAuths.entries()) {
        $scope.selectedDocType.authorized[index] = {
          _id: value._id,
          priority: value.priority
        };
      }

      $scope.selectedDocType.bossPriority = false;
    }

    if ($scope.selectedDocType.edit) {
      let id = $scope.selectedDocType._id;
      $http.put('/api/document-types/' + id, $scope.selectedDocType)
        .then(function(response) {
          commonFactory.toastMessage('Tipo de documento ' + $scope.selectedDocType.type + ' fue actualizado exitosamente!', 'info');
          $scope.selectedDocType = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      $scope.selectedDocType.created = new Date();
      $http.post('/api/document-types/', $scope.selectedDocType)
        .then(function(response) {
          commonFactory.toastMessage('Tipo de documento ' + $scope.selectedDocType.type + ' fue guardado exitosamente!', 'success');
          $scope.selectedDocType = {};
        })
        .catch(function(error) {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Tipo de Documento ${$scope.selectedDocType.type} ya existe.`, 'danger');
          }
        });
    }

    retrieveDocTypes();
  }

  $scope.updateDocType = function(docType) {
    $scope.selectedDocType = angular.copy(docType);
    $scope.selectedDocType.edit = true;

    $scope.choices.number = $scope.selectedDocType.authorized.length;
    for (let [index, value] of $scope.selectedDocType.authorized.entries()) {
      $scope.selectedAuths[index] = {
        _id: value._id,
        priority: value.priority
      };
    }
  }

  $scope.deleteDocType = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este tipo de documento?")) {
      $http.delete('/api/document-types/' + id)
        .then(function(response) {
          commonFactory.activateAlert('Tipo de documento borrado exitosamente!', 'danger');
          retrieveDocTypes();
          $scope.selectedDocType = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  function initializeController() {
    retrieveDocTypes();
    retrieveClients();
    $scope.choiceOptions = commonFactory.generateNumberArray(1, 20);
    $scope.priorityLevels = commonFactory.generateNumberArray(1, 3);
    $scope.selectedAuths = [{}];
    $scope.choices = {};
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

  function retrieveClients() {
    $http.get('/api/clients/')
      .then(function(response) {
        $scope.clients = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

DocTypesController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('docTypesController', DocTypesController);
