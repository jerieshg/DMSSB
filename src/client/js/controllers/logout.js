function LogoutController($scope, $location, authentication) {

  $scope.logout = function() {
    authentication.logout();
    $location.path("/login");
  }
}

LogoutController.$inject = ['$scope', '$location', 'authentication'];
angular.module('app').controller('logoutController', LogoutController);
