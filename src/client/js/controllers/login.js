function LoginController($scope, $state, $window, commonFactory, authentication) {

  $scope.credentials = {};

  $scope.login = function() {
    authentication.login($scope.credentials)
      .then(function(response) {
        switch (response.status) {
          case 401:
            commonFactory.activateAlert(response.data.message, 'danger');
            break;
          case 200:
            var ua = navigator.userAgent;

            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
              $state.go('app.main');
            } else {
              $window.location.reload();
            }
            break;
        }
      });
  }
}

LoginController.$inject = ['$scope', '$state', '$window', 'commonFactory', 'authentication'];
angular.module('app').controller('loginController', LoginController);
