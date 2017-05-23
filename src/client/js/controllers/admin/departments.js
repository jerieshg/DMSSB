function DepartmentController($scope, $http, commonFactory, departments, business) {

  initializeController();

  $scope.disableDocRevision = function() {
    if ($scope.selectedDept.isSGIA) {
      $scope.selectedDept.documentRevision = false;
      return true;
    }

    return false;
  }

  $scope.disableSGIA = function() {
    if ($scope.selectedDept.documentRevision) {
      $scope.selectedDept.isSGIA = false;
      return true;
    }

    return false;
  }

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newDept = function() {
    $scope.selectedDept = {};
  }

  $scope.saveDepartment = function() {
    if ($scope.selectedDept.edit) {
      departments.update($scope.selectedDept)
        .then((data) => {
          $scope.selectedDept = {};
          retrieveDepartments();
        });
    } else {
      $scope.selectedDept.created = new Date();
      departments.save($scope.selectedDept)
        .then((data) => {
          $scope.selectedDept = {};
          retrieveDepartments();
        });
    }
  }

  $scope.updateDepartment = function(id) {
    departments.find(id)
      .then((data) => {
        $scope.selectedDept = data;
        $scope.selectedDept.edit = true;
      })
  }

  $scope.deleteDepartment = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este departamento?")) {
      departments.delete(id)
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
    retrieveBusiness();
  }

  function retrieveDepartments() {
    departments.readAll()
      .then((data) => {
        $scope.departments = data;
      })
  }

  function retrieveBusiness() {
    business.readAll()
      .then((data) => {
        $scope.business = data;
      })
  }
}

DepartmentController.$inject = ['$scope', '$http', 'commonFactory', 'departments', 'business'];
angular.module('app').controller('departmentsController', DepartmentController);
