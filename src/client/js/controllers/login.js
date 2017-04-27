function LoginController($scope, $state, commonFactory, authentication) {

  $scope.credentials = {};

  $scope.login = function() {
    authentication.login($scope.credentials)
      .then(function(response) {
        switch (response.status) {
          case 401:
            commonFactory.activateAlert(response.data.message, 'danger');
            break;
          case 200:
            $state.go('app.main');
            break;
        }
      });
  }
}

LoginController.$inject = ['$scope', '$state', 'commonFactory', 'authentication'];
angular.module('app').controller('loginController', LoginController);
