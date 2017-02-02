angular.module('app').controller('surveyController', ['$scope', '$http', 'commonFactory', function($scope, $http, commonFactory) {

  init();


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
