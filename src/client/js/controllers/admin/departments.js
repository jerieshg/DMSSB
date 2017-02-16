function DepartmentController($scope, $http, commonFactory) {
  
  initializeController();

  $scope.selectedDept = {};

  $scope.saveDepartment = function() {
    if ($scope.selectedDept.edit) {
      let id = $scope.selectedDept._id;
      $http.put('/api/departments/' + id, $scope.selectedDept)
        .then(
          function(response) {
            commonFactory.activateAlert('Departmento ' + $scope.selectedDept.department + ' fue actualizado exitosamente!', 'info');
            $scope.selectedDept = {};
          },
          function(response) {
            console.log(response);
          }
        );
    } else {
      $scope.selectedDept.created = new Date();
      $http.post('/api/departments/', $scope.selectedDept)
        .then(
          function(response) {
            commonFactory.activateAlert('Departmento ' + $scope.selectedDept.department + ' fue guardado exitosamente!', 'success');
            $scope.selectedDept = {};
          },
          function(response) {
            console.log(response);
          }
        );
    }

    retrieveDepartments();
  }

  $scope.updateDepartment = function(id) {
    $http.get('/api/departments/' + id)
      .then(
        function(response) {
          $scope.selectedDept = response.data;
          $scope.selectedDept.edit = true;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  $scope.deleteDepartment = function(id) {
    $http.delete('/api/departments/' + id)
      .then(
        function(response) {
          commonFactory.activateAlert('Departmento borrada exitosamente!', 'danger');
          retrieveDepartments();
          $scope.selectedDept = {};
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function initializeController() {
    retrieveDepartments();
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

DepartmentController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('departmentsController', DepartmentController);
