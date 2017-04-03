function SystemController($rootScope, $scope, $http, commonFactory, system, implications) {

  initializeController();

  $scope.selectedSystem = {};

  $scope.newSystem = function() {
    $scope.selectedSystem = {};
  }

  $scope.saveSystem = function() {
    if ($scope.selectedSystem.edit) {
      let id = $scope.selectedSystem._id;
      system.update($scope.selectedSystem)
        .then((data) => {
          $scope.selectedSystem = {};
          retrieveSystems();
        });
    } else {
      $scope.selectedSystem.created = new Date();
      system.save($scope.selectedSystem)
        .then((data) => {
          $scope.selectedSystem = {};
          retrieveSystems();
        });
    }
  }

  $scope.updateSystem = function(id) {
    system.find(id)
      .then((data) => {
        $scope.selectedSystem = data;
        $scope.selectedSystem.edit = true;
      });
  }

  $scope.deleteSystem = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este sistema?")) {
      system.delete(id)
        .then((data) => {
          retrieveSystems();
          $scope.selectedSystem = {};
        });
    }
  }

  function initializeController() {
    retrieveSystems();
    retrieveImplications();
  }

  function retrieveSystems() {
    system.readAll()
      .then((data) => {
        $scope.systems = data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveImplications() {
    implications.readAll()
      .then((data) => {
        $scope.implications = data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

}

SystemController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'system', 'implications'];
angular.module('app').controller('systemController', SystemController);
