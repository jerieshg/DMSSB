function ClientController($scope, $http, commonFactory) {
  
  initializeController();

  $scope.selectedClient = {};

  $scope.saveClient = function() {
    if ($scope.selectedClient.edit) {
      let id = $scope.selectedClient._id;
      $http.put('/api/clients/' + id, $scope.selectedClient)
        .then(
          function(response) {
            commonFactory.activateAlert('Usuario ' + $scope.selectedClient.username + ' fue actualizado exitosamente!', 'info');
            $scope.selectedClient = {};
          },
          function(response) {
            console.log(response);
          }
        );
    } else {
      $scope.selectedClient.created = new Date();
      $http.post('/api/clients/', $scope.selectedClient)
        .then(
          function(response) {
            commonFactory.activateAlert('Usuario ' + $scope.selectedClient.username + ' fue guardado exitosamente!', 'success');
            $scope.selectedClient = {};
          },
          function(response) {
            console.log(response);
          }
        );
    }

    retrieveClients();
  }

  $scope.updateClient = function(id) {
    $http.get('/api/clients/' + id)
      .then(
        function(response) {
          $scope.selectedClient = response.data;
          $scope.selectedClient.edit = true;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  $scope.deleteClient = function(id) {
    $http.delete('/api/clients/' + id)
      .then(
        function(response) {
          commonFactory.activateAlert('Usuario borrada exitosamente!', 'danger');
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
}

ClientController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('clientsController', ClientController);
