function DepartmentController($scope, $http, commonFactory, department) {

  initializeController();

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newDept = function() {
    $scope.selectedDept = {};
  }

  $scope.saveDepartment = function() {
    if ($scope.selectedDept.edit) {
      let id = $scope.selectedDept._id;
      department.update($scope.selectedDept)
        .then((data) => {
          $scope.selectedDept = {};
        });
    } else {
      $scope.selectedDept.created = new Date();
      department.save($scope.selectedDept)
        .then((data) => {
          $scope.selectedDept = {};
        });
    }

    retrieveDepartments();
  }

  $scope.updateDepartment = function(id) {
    department.find(id)
      .then((data) => {
        $scope.selectedDept = data;
        $scope.selectedDept.edit = true;
      })
  }

  $scope.deleteDepartment = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este departamento?")) {
      department.delete(id)
        .then((data) => {
          retrieveDepartments();
          $scope.selectedDept = {};
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  function initializeController() {
    $scope.selectedDept = {};
    retrieveDepartments();
  }

  function retrieveDepartments() {
    department.readAll()
      .then((data) => {
        $scope.departments = data;
      })
  }
}

DepartmentController.$inject = ['$scope', '$http', 'commonFactory', 'department'];
angular.module('app').controller('departmentsController', DepartmentController);
