function SurveyController($rootScope, $scope, $http, commonFactory) {

  initializeController();

  function initializeController() {
    retrieveSurveys();
  }

  function retrieveSurveys() {

    let url = `/api/surveys/clients/${$rootScope.client.username}`;

    if ($rootScope.client.role.level === 1) {
      url = '/api/surveys/';
    } else if ($rootScope.client.role.level === 2) {
      url = `/api/surveys/department/${$rootScope.client.department}`;
    }

    $http.get(url)
      .then(function(response) {
        $scope.surveys = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

SurveyController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory'];
angular.module('app').controller('surveyController', SurveyController);
