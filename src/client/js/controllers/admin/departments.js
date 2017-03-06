function DepartmentController($scope, $http, commonFactory) {

  initializeController();

  $scope.selectedDept = {};

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newDept = function() {
    $scope.selectedDept = {};
  }

  $scope.saveDepartment = function() {
    if ($scope.selectedDept.edit) {
      let id = $scope.selectedDept._id;
      $http.put('/api/departments/' + id, $scope.selectedDept)
        .then(function(response) {
          commonFactory.toastMessage('Departmento ' + $scope.selectedDept.department + ' fue actualizado exitosamente!', 'info');
          $scope.selectedDept = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      $scope.selectedDept.created = new Date();
      $http.post('/api/departments/', $scope.selectedDept)
        .then(function(response) {
          commonFactory.toastMessage('Departmento ' + $scope.selectedDept.department + ' fue guardado exitosamente!', 'success');
          $scope.selectedDept = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }

    retrieveDepartments();
  }

  $scope.updateDepartment = function(id) {
    $http.get('/api/departments/' + id)
      .then(function(response) {
        $scope.selectedDept = response.data;
        $scope.selectedDept.edit = true;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  $scope.deleteDepartment = function(id) {
    if (confirm("Esta seguro de borrar este departamento?")) {
      $http.delete('/api/departments/' + id)
        .then(function(response) {
          commonFactory.activateAlert('Departmento borrada exitosamente!', 'danger');
          retrieveDepartments();
          $scope.selectedDept = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  function initializeController() {
    retrieveDepartments();
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

DepartmentController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('departmentsController', DepartmentController);
