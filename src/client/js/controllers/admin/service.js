function ServiceController($scope, $http, commonFactory) {

  initializeController();

  $scope.selectedService = {};

  $scope.newService = function() {
    $scope.selectedService = {};
  }

  $scope.saveService = function() {
    if ($scope.selectedService.edit) {
      let id = $scope.selectedService._id;
      $http.put('/api/services/' + id, $scope.selectedService)
        .then(function(response) {
          commonFactory.toastMessage('Servicio ' + $scope.selectedService.service + ' fue actualizado exitosamente!', 'info');
          $scope.selectedService = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      $scope.selectedService.created = new Date();
      $http.post('/api/services/', $scope.selectedService)
        .then(function(response) {
          commonFactory.toastMessage('Servicio ' + $scope.selectedService.service + ' fue guardado exitosamente!', 'success');
          $scope.selectedService = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }

    retrieveService();
  }

  $scope.updateService = function(id) {
    $http.get('/api/services/' + id)
      .then(function(response) {
        $scope.selectedService = response.data;
        $scope.selectedService.edit = true;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  $scope.deleteService = function(id) {
    if (confirm("Esta seguro de borrar este servicio?")) {
      $http.delete('/api/services/' + id)
        .then(function(response) {
          commonFactory.activateAlert('Servicio borrada exitosamente!', 'danger');
          retrieveService();
          $scope.selectedService = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  function initializeController() {
    retrieveService();
    retrieveDepartments();
  }

  function retrieveService() {
    $http.get('/api/services/')
      .then(function(response) {
        $scope.services = response.data;
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
}

ServiceController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('serviceController', ServiceController);
