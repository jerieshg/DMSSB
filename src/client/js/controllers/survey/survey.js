function SurveyController($rootScope, $scope, $http, commonFactory) {

  initializeController();

  function initializeController() {
    retrieveSurveys();
  }

  function retrieveSurveys() {
    let client = $rootScope.client;
    let url = `/api/surveys/clients/${client.username}`;

    if (client.role.role === 'Admin') {
      url = '/api/surveys/';
    }

    $http.get(url)
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

SurveyController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory'];
angular.module('app').controller('surveyController', SurveyController);
