function DocTypesController($scope, $http, commonFactory, documentTypes, clients) {

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
      documentTypes.update($scope.selectedDocType)
        .then((data) => {
          $scope.selectedDocType = {};
          retrieveDocTypes();
        });
    } else {
      $scope.selectedDocType.created = new Date();
      documentTypes.save($scope.selectedDocType)
        .then((data) => {
          $scope.selectedDocType = {};
          retrieveDocTypes();
        });
    }
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
      documentTypes.delete(id)
        .then((data) => {
          retrieveDocTypes();
          $scope.selectedDocType = {};
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
    documentTypes.readAll()
      .then((data) => {
        $scope.docTypes = data;
      });
  }

  function retrieveClients() {
    clients.readAll()
      .then((data) => {
        $scope.clients = data;
      });
  }
}

DocTypesController.$inject = ['$scope', '$http', 'commonFactory', 'documentTypes', 'clients'];
angular.module('app').controller('docTypesController', DocTypesController);
