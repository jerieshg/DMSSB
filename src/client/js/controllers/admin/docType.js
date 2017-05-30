function DocTypesController($scope, $http, commonFactory, documentTypes, clients, business, departments, requestType, documentStatus) {

  initializeController();

  $scope.selectedDocType = {};

  $scope.addRequestTypeInfo = function(selectedRequestType) {
    $scope.selectedDocType.requests[selectedRequestType.type] = $scope.selectedDocType.requests[selectedRequestType.type] || {};
    $scope.selectedDocType.requests[selectedRequestType.type].dataUpdateOnly = selectedRequestType.dataUpdateOnly
    $scope.selectedDocType.requests[selectedRequestType.type].hideWhenPublished = selectedRequestType.hideWhenPublished
  }

  $scope.addStep = function() {
    $scope.selectedDocType.requests[$scope.selectedRequestType.type][$scope.selectedBusiness.name] = $scope.selectedDocType.requests[$scope.selectedRequestType.type][$scope.selectedBusiness.name] || [];
    $scope.selectedDocType.requests[$scope.selectedRequestType.type][$scope.selectedBusiness.name].push({});
  }

  $scope.removeStep = function(step) {
    $scope.selectedDocType.requests[$scope.selectedRequestType.type][$scope.selectedBusiness.name].splice(step, 1);
  }

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newDocType = function() {
    $scope.selectedDocType = {
      flow: {},
      requests: {},
      forEnvironment: false,
      requiresDept: false,
      bossPriorty: false
    };
    $scope.selectedBusiness = {};
    $scope.selectedRequestType = {};
    $scope.choices.number = 0;
  }

  $scope.resetApprovalList = function(item) {
    if (item.requiresDept) {
      item.approvals = {};
    } else {
      item.approvals = [];
    }
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
    $scope.selectedRequestType = {};
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
    retrieveStepNames();
    retrieveDocTypes();
    retrieveClients();
    retrieveBusiness();
    retrieveDepartment();
    retrieveRequestTypes();
    retrieveDocumentStatus();
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

  function retrieveRequestTypes() {
    requestType.readAll()
      .then((data) => {
        $scope.requestTypes = data;
      });
  }

  function retrieveDocumentStatus() {
    documentStatus.readAll()
      .then((data) => {
        $scope.documentStatuses = data;
      })
  }

  function retrieveStepNames() {
    $scope.stepNames = ["Jefe de departamento", "Seguridad Industrial", "Gerencia", "Medioambiente", "Calidad", "Preparacion para publicacion"];
  }
}

DocTypesController.$inject = ['$scope', '$http', 'commonFactory', 'documentTypes', 'clients', 'business', 'departments', 'requestType', 'documentStatus'];
angular.module('app').controller('docTypesController', DocTypesController);
