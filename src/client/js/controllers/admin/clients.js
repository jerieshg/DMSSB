function ClientController($scope, $http, commonFactory, authentication) {

  initializeController();

  $scope.selectedClient = {};

  $scope.newClient = function() {
    $scope.selectedClient = {};
  }

  $scope.saveClient = function() {
    if ($scope.selectedClient.edit) {
      let id = $scope.selectedClient._id;
      $http.put('/api/clients/' + id, $scope.selectedClient)
        .then(function(response) {
          commonFactory.activateAlert('Cliente ' + $scope.selectedClient.username + ' fue actualizado exitosamente!', 'info');
          $scope.selectedClient = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      $scope.selectedClient.created = new Date();
      authentication.register($scope.selectedClient)
        .then(function(response) {
          if (response.status === 200) {
            commonFactory.activateAlert('Cliente ' + $scope.selectedClient.username + ' fue creado exitosamente!', 'success');
            $scope.selectedClient = {};
          }
        });
    }

    retrieveClients();
  }

  $scope.updateClient = function(client) {
    $scope.selectedClient = angular.copy(client);
    $scope.selectedClient.edit = true;
  }

  $scope.deleteClient = function(id) {
    if (confirm("Esta seguro de borrar este cliente?")) {
      $http.delete('/api/clients/' + id)
        .then(function(response) {
          commonFactory.activateAlert('Cliente borrado exitosamente!', 'danger');
          retrieveClients();
          $scope.selectedClient = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  function initializeController() {
    retrieveClients();
    retrieveRoles();
    retrieveDepartments();
    retrieveJobs();
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

  function retrieveRoles() {
    $http.get('/api/roles/')
      .then(function(response) {
        $scope.roles = response.data;
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

  function retrieveJobs() {
    $http.get('/api/jobs/')
      .then(function(response) {
        $scope.jobs = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

ClientController.$inject = ['$scope', '$http', 'commonFactory', 'authentication'];
angular.module('app').controller('clientsController', ClientController);
