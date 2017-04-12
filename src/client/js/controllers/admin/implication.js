function ImplicationController($rootScope, $scope, $http, commonFactory, implications) {

  initializeController();

  $scope.selectedImplication = {};

  $scope.newImplication = function() {
    $scope.selectedImplication = {};
  }

  $scope.saveImplication = function() {
    if ($scope.selectedImplication.edit) {
      implications.update($scope.selectedImplication)
        .then((data) => {
          $scope.selectedImplication = {};
          retrieveImplications();
        });
    } else {
      $scope.selectedImplication.created = new Date();
      implications.save($scope.selectedImplication)
        .then((data) => {
          $scope.selectedImplication = {};
          retrieveImplications();

        });
    }
  }

  $scope.updateImplication = function(id) {
    implications.find(id)
      .then((data) => {
        $scope.selectedImplication = data;
        $scope.selectedImplication.edit = true;
      });
  }

  $scope.deleteImplication = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar esta implicacion?")) {
      implications.delete(id)
        .then((data) => {
          retrieveImplications();
          $scope.selectedImplication = {};
        });
    }
  }

  function initializeController() {
    retrieveImplications();
  }

  function retrieveImplications() {
    implications.readAll()
      .then((data) => {
        $scope.implications = data;
        if ($rootScope.client.role.level === 2) {
          $scope.implications = $scope.implications.filter((e) => $rootScope.client.department === e.department);
        }
      });
  }

}

ImplicationController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'implications'];
angular.module('app').controller('implicationController', ImplicationController);
