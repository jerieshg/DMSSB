function SurveyController($rootScope, $scope, $http, commonFactory, surveyResponse) {

  initializeController();

  $scope.respondedSurvey = function(e) {
    e.completed = $scope.surveyResponses.includes(e._id);
    return e.completed;
  }

  function initializeController() {
    $scope.surveyResponses = [];
    retrieveSurveys();
    retrieveSurveyResponses();
  }

  function retrieveSurveyResponses() {
    surveyResponse.findByClient($rootScope.client._id)
      .then(function(response) {
        $scope.surveyResponses = response.data.map(e => e.surveyId);
      });
  }

  function retrieveSurveys() {

    let url = `/api/surveys/clients/${$rootScope.client._id}`;

    if ($rootScope.client.role.level === 1) {
      url = '/api/surveys/';
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

SurveyController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'surveyResponse'];
angular.module('app').controller('surveyController', SurveyController);
