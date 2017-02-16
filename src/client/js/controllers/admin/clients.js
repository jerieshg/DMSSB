function ClientController($scope, $http, commonFactory, authentication) {

  initializeController();

  $scope.selectedClient = {};

  $scope.saveClient = function() {
    if ($scope.selectedClient.edit) {
      let id = $scope.selectedClient._id;
      $http.put('/api/clients/' + id, $scope.selectedClient)
        .then(
          function(response) {
            commonFactory.activateAlert('Cliente ' + $scope.selectedClient.username + ' fue actualizado exitosamente!', 'info');
            $scope.selectedClient = {};
          },
          function(response) {
            console.log(response);
          }
        );
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
    $http.delete('/api/clients/' + id)
      .then(
        function(response) {
          commonFactory.activateAlert('Cliente borrado exitosamente!', 'danger');
          retrieveClients();
          $scope.selectedClient = {};
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function initializeController() {
    retrieveClients();
    retrieveRoles();
    retrieveDepartments();
  }

  function retrieveClients() {
    $http.get('/api/clients/')
      .then(
        function(response) {
          $scope.clients = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function retrieveRoles() {
    $http.get('/api/roles/')
      .then(
        function(response) {
          $scope.roles = response.data;
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

ClientController.$inject = ['$scope', '$http', 'commonFactory', 'authentication'];
angular.module('app').controller('clientsController', ClientController);
