function SearchDocumentController($rootScope, $scope, $http, commonFactory, departments) {

  initializeController();

  $scope.doSearch = function() {
    if ($scope.search && !commonFactory.checkProperties($scope.search)) {
      $http.post('/api/documents/search/', $scope.search)
        .then((response) => {
          $scope.searchDocuments = response.data;
          commonFactory.toastMessage(`Se han encontrado ${$scope.searchDocuments.length} documento(s)`, 'info');
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      commonFactory.toastMessage('No se ha escogido elementos de busqueda, por favor ingrese al menos uno.', 'danger');
      $scope.searchDocuments = [];
    }
  }

  function initializeController() {
    retrieveDepartments();
  }

  function retrieveDepartments() {
    departments.readAll()
      .then((data) => {
        $scope.departments = data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

}

SearchDocumentController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'departments'];
angular.module('app').controller('searchDocumentController', SearchDocumentController);
