function DocTypesController($scope, $http, commonFactory, documentTypes, clients, business, departments) {

  initializeController();

  $scope.selectedDocType = {};

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.loadBusinessFlow = function() {
    if ($scope.selectedBusiness.name) {
      // $scope.selectedFlow = $scope.selectedDocType.flow.find((e) => e.business === $scope.selectedBusiness.name);
      let selectedFlow = $scope.selectedDocType.flow[$scope.selectedBusiness.name];

      if (!selectedFlow) {
        $scope.selectedDocType.flow[$scope.selectedBusiness.name] = {};
        $scope.selectedDocType.flow[$scope.selectedBusiness.name].approvals = {
          deptBoss: {},
          sgia: [],
          qa: [],
          management: [],
        }
      }
    }
  }

  $scope.newDocType = function() {
    $scope.selectedDocType = {
      flow: {}
    };
    $scope.selectedBusiness = {};
    $scope.choices.number = 0;
  }

  $scope.saveDocType = function() {
    if ($scope.selectedDocType.edit) {
      documentTypes.update($scope.selectedDocType)
        .then((data) => {
          retrieveDocTypes();
        });
    } else {
      $scope.selectedDocType.created = new Date();
      documentTypes.save($scope.selectedDocType)
        .then((data) => {
          retrieveDocTypes();
        });
    }
  }

  $scope.clear = function() {
    $scope.selectedDocType = {};
    $scope.selectedBusiness = {};
  }

  $scope.updateDocType = function(docType) {
    $scope.selectedDocType = angular.copy(docType);
    $scope.selectedDocType.edit = true;
    $scope.selectedBusiness = {};
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
    retrieveBusiness();
    retrieveDepartment();
    $scope.choiceOptions = commonFactory.generateNumberArray(1, 20);
    $scope.priorityLevels = commonFactory.generateNumberArray(1, 3);
    $scope.selectedAuths = [{}];
    $scope.choices = {};
    $scope.selectedBusiness = {};
    $scope.filter = {
      deptBoss: ''
    }
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

  function retrieveDepartment() {
    departments.readAll()
      .then((data) => {
        $scope.departments = data;
      });
  }

  function retrieveBusiness() {
    business.readAll()
      .then((data) => {
        $scope.business = data;
      });
  }
}

DocTypesController.$inject = ['$scope', '$http', 'commonFactory', 'documentTypes', 'clients', 'business', 'departments'];
angular.module('app').controller('docTypesController', DocTypesController);
