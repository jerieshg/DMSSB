function LoginController($scope, $location, commonFactory, authentication) {

  $scope.credentials = {};

  $scope.login = function() {
    authentication.login($scope.credentials)
      .then(function(response) {
        switch (response.status) {
          case 401:
            commonFactory.activateAlert(response.data.message, 'danger');
            break;
          case 200:
            $location.path("/dashboard");
            break;
        }
      });
  }
}

LoginController.$inject = ['$scope', '$location', 'commonFactory', 'authentication'];
angular.module('app').controller('loginController', LoginController);
