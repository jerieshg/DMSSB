function ClientController($scope, $http, commonFactory, authentication, clients, departments, jobs, business) {

  initializeController();

  $scope.selectedClient = {};

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newClient = function() {
    $scope.selectedClient = {};
  }

  $scope.saveClient = function() {
    if ($scope.selectedClient.edit) {
      clients.update($scope.selectedClient)
        .then((data) => {
          $scope.selectedClient = {};
          retrieveClients();
        });
    } else {
      $scope.selectedClient.created = new Date();
      authentication.register($scope.selectedClient)
        .then((response) => {
          if (response.status === 200) {
            commonFactory.toastMessage('Cliente ' + $scope.selectedClient.username + ' fue creado exitosamente!', 'success');
            $scope.selectedClient = {};
            retrieveClients();
          } else if (response.status === 500) {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${response.data.errmsg}`, 'danger');

            if (response.data && response.data.code === 11000) {
              commonFactory.toastMessage(`Cliente ${$scope.selectedClient.username} ya existe.`, 'danger');
            }
          }
        });
    }
  }

  $scope.updateClient = function(client) {
    $scope.selectedClient = angular.copy(client);
    $scope.selectedClient.edit = true;
  }

  $scope.deleteClient = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este cliente?")) {
      clients.delete(id)
        .then((data) => {
          retrieveClients();
          $scope.selectedClient = {};
        });
    }
  }

  function initializeController() {
    retrieveClients();
    retrieveRoles();
    retrieveDepartments();
    retrieveJobs();
    retrieveBusiness();
  }

  function retrieveClients() {
    clients.readAll()
      .then((data) => {
        $scope.clients = data;
      });
  }

  function retrieveRoles() {
    $http.get('/api/roles/')
      .then((response) => {
        $scope.roles = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDepartments() {
    departments.readAll()
      .then((data) => {
        $scope.departments = data;
      });
  }

  function retrieveJobs() {
    jobs.readAll()
      .then((data) => {
        $scope.jobs = data;
      });
  }

  function retrieveBusiness() {
    business.readAll()
      .then((data) => {
        $scope.business = data;
      })
  }
}

ClientController.$inject = ['$scope', '$http', 'commonFactory', 'authentication', 'clients', 'departments', 'jobs', 'business'];
angular.module('app').controller('clientsController', ClientController);
