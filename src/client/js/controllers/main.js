angular.module('app').controller('mainController', ['$scope', '$http', 'commonFactory', function($scope, $http, commonFactory) {

  init();

  $scope.deleteSurvey = function(id) {
    $http.delete("/api/surveys/" + id)
      .then(
        function(response) {
          // success callback
          commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'info');
          retrieveSurveys(s);
        },
        function(response) {
          // failure callback
          commonFactory.activateAlert('Woops! Algo paso!', 'danger');
        }
      );

  }

  function init() {
    retrieveSurveys();
  }

  function retrieveSurveys() {
    $http.get('/api/surveys/')
      .then(
        function(response) {
          $scope.surveys = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }

}]);
