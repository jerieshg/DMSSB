function BusinessController($scope, $http, commonFactory, business) {

  initializeController();

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newBusiness = function() {
    $scope.selectedBusiness = {};
  }

  $scope.saveBusiness = function() {
    if ($scope.selectedBusiness.edit) {
      business.update($scope.selectedBusiness)
        .then((data) => {
          $scope.selectedBusiness = {};
          retrieveBusiness();
        });
    } else {
      $scope.selectedBusiness.created = new Date();
      business.save($scope.selectedBusiness)
        .then((data) => {
          $scope.selectedBusiness = {};
          retrieveBusiness();
        });
    }
  }

  $scope.updateBusiness = function(id) {
    business.find(id)
      .then((data) => {
        $scope.selectedBusiness = data;
        $scope.selectedBusiness.edit = true;
      })
  }

  $scope.deleteBusiness = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar esta empresa?")) {
      business.delete(id)
        .then((data) => {
          retrieveBusiness();
          $scope.selectedBusiness = {};
        })
    }
  }

  function initializeController() {
    $scope.selectedBusiness = {};
    retrieveBusiness();
  }

  function retrieveBusiness() {
    business.readAll()
      .then((data) => {
        $scope.business = data;
      })
  }
}

BusinessController.$inject = ['$scope', '$http', 'commonFactory', 'business'];
angular.module('app').controller('businessController', BusinessController);
