function RequestTypeController($scope, $http, commonFactory, requestType) {

  initializeController();

  $scope.selectedRequestType = {};

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.new = function() {
    $scope.selectedRequestType = {};
  }

  $scope.save = function() {
    if ($scope.selectedRequestType.edit) {
      requestType.update($scope.selectedRequestType)
        .then((data) => {
          $scope.selectedRequestType = {};
          retrieveRequestTypes();
        });
    } else {
      $scope.selectedRequestType.created = new Date();
      requestType.save($scope.selectedRequestType)
        .then((data) => {
          $scope.selectedRequestType = {};
          retrieveRequestTypes();
        });
    }
  }

  $scope.update = function(id) {
    requestType.find(id)
      .then((data) => {
        $scope.selectedRequestType = data;
        $scope.selectedRequestType.edit = true;
      });
  }

  $scope.delete = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este tipo de soliciud?")) {
      requestType.delete(id)
        .then((data) => {
          retrieveRequestTypes();
          $scope.selectedRequestType = {};
        });
    }
  }

  function initializeController() {
    retrieveRequestTypes();
  }

  function retrieveRequestTypes() {
    requestType.readAll()
      .then((data) => {
        $scope.requestTypes = data;
      });
  }
}

RequestTypeController.$inject = ['$scope', '$http', 'commonFactory', 'requestType'];
angular.module('app').controller('requestTypeController', RequestTypeController);
