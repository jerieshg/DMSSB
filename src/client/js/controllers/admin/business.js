function BusinessController($scope, $http, commonFactory) {

  initializeController();

  $scope.selectedBusiness = {};

  $scope.saveBusiness = function() {
    if ($scope.selectedBusiness.edit) {
      let id = $scope.selectedBusiness._id;
      $http.put('/api/business/' + id, $scope.selectedBusiness)
        .then(function(response) {
          commonFactory.activateAlert('Empresa ' + $scope.selectedBusiness.business + ' fue actualizado exitosamente!', 'info');
          $scope.selectedBusiness = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      $scope.selectedBusiness.created = new Date();
      $http.post('/api/business/', $scope.selectedBusiness)
        .then(function(response) {
          commonFactory.activateAlert('Empresa ' + $scope.selectedBusiness.business + ' fue guardado exitosamente!', 'success');
          $scope.selectedBusiness = {};
        })
        .catch(function(error) {
          console.log(error);
        });
    }

    retrieveBusiness();
  }

  $scope.updateBusiness = function(id) {
    $http.get('/api/business/' + id)
      .then(function(response) {
        $scope.selectedBusiness = response.data;
        $scope.selectedBusiness.edit = true;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  $scope.deleteBusiness = function(id) {
    $http.delete('/api/business/' + id)
      .then(function(response) {
        commonFactory.activateAlert('Empresa borrada exitosamente!', 'danger');
        retrieveBusiness();
        $scope.selectedBusiness = {};
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function initializeController() {
    retrieveBusiness();
  }

  function retrieveBusiness() {
    $http.get('/api/business/')
      .then(function(response) {
        $scope.business = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

BusinessController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('businessController', BusinessController);
