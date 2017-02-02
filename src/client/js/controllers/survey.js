function SurveyController($scope, $http, commonFactory) {

  initializeController();

  function initializeController() {
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
}

SurveyController.$inject = ['$scope', '$http', 'commonFactory'];
angular.module('app').controller('surveyController', SurveyController);
