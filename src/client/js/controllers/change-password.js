function ChangePasswordController($rootScope, $scope, commonFactory, authentication) {

  $scope.resetPasswordForm = function() {
    $scope.passwords = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  }

  $scope.changePassword = function() {
    authentication.changePassword($rootScope.client._id, $scope.passwords)
      .then((response) => {
        if (response.status === 400) {
          commonFactory.toastMessage('Contraseña vieja no es la correcta! Por favor intente de nuevo', 'danger');
        } else {
          commonFactory.toastMessage('Su contraseña ha sido cambiada exitosamente!', 'success');
        }
      });
  }
}

ChangePasswordController.$inject = ['$rootScope', '$scope', 'commonFactory', 'authentication'];
angular.module('app').controller('changePasswordController', ChangePasswordController);
