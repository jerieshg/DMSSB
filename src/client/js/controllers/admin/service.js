function ServiceController($scope, $http, commonFactory) {
  
  initializeController();

  $scope.selectedService = {};

  $scope.saveService = function() {
    if ($scope.selectedService.edit) {
      let id = $scope.selectedService._id;
      $http.put('/api/services/' + id, $scope.selectedService)
        .then(
          function(response) {
            commonFactory.activateAlert('Servicio ' + $scope.selectedService.service + ' fue actualizado exitosamente!', 'info');
            $scope.selectedService = {};
          },
          function(response) {
            console.log(response);
          }
        );
    } else {
      $scope.selectedService.created = new Date();
      $http.post('/api/services/', $scope.selectedService)
        .then(
          function(response) {
            commonFactory.activateAlert('Servicio ' + $scope.selectedService.service + ' fue guardado exitosamente!', 'success');
            $scope.selectedService = {};
          },
          function(response) {
            console.log(response);
          }
        );
    }

    retrieveService();
  }

  $scope.updateService = function(id) {
    $http.get('/api/services/' + id)
      .then(
        function(response) {
          $scope.selectedService = response.data;
          $scope.selectedService.edit = true;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  $scope.deleteService = function(id) {
    $http.delete('/api/services/' + id)
      .then(
        function(response) {
          commonFactory.activateAlert('Servicio borrada exitosamente!', 'danger');
          retrieveService();
          $scope.selectedService = {};
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function initializeController() {
    retrieveService();
    retrieveDepartments();
  }

  function retrieveService() {
    $http.get('/api/services/')
      .then(
        function(response) {
          $scope.services = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function retrieveDepartments() {
    $http.get('/api/departments/')
      .then(
        function(response) {
          $scope.departments = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }
}

ServiceController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('serviceController', ServiceController);
