function ServiceController($rootScope, $scope, $http, commonFactory, service, department) {

  initializeController();

  $scope.selectedService = {};

  $scope.newService = function() {
    $scope.selectedService = {};
  }

  $scope.saveService = function() {
    if ($scope.selectedService.edit) {
      service.update($scope.selectedService)
        .then((response) => {
          $scope.selectedService = {};
          retrieveService();
        });
    } else {
      $scope.selectedService.created = new Date();
      service.save($scope.selectedService)
        .then((response) => {
          $scope.selectedService = {};
          retrieveService();
        });
    }


  }

  $scope.updateService = function(id) {
    service.find(id)
      .then(function(data) {
        $scope.selectedService = data;
        $scope.selectedService.edit = true;
      });
  }

  $scope.deleteService = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este servicio?")) {
      service.delete(id)
        .then((response) => {
          retrieveService();
          $scope.selectedService = {};
        });
    }
  }

  function initializeController() {
    retrieveService();
    retrieveDepartments();
  }

  function retrieveService() {
    service.readAll()
      .then((data) => {
        $scope.services = data;
        if ($rootScope.client.role.level === 2) {
          $scope.services = $scope.services.filter((e) => $rootScope.client.department === e.department);
        }
      });
  }

  function retrieveDepartments() {
    department.readAll()
      .then((data) => {
        $scope.departments = data;
        if ($rootScope.client.role.level === 2) {
          $scope.departments = $scope.departments.filter((e) => $rootScope.client.department === e.department);
        }
      });
  }
}

ServiceController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'service', 'department'];
angular.module('app').controller('serviceController', ServiceController);
