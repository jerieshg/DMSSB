function SurveyController($rootScope, $scope, $http, commonFactory) {

  initializeController();

  $scope.respondedSurvey = function(e) {
    if ($scope.surveyResponses.includes(e._id)) {
      e.completed = true;
      return true;
    }
    return false;
  }

  function initializeController() {
    $scope.surveyResponses = [];
    retrieveSurveys();
    retrieveSurveyResponses();
  }

  function retrieveSurveyResponses() {
    $http.get(`/api/surveys/responses/client/${$rootScope.client._id}`)
      .then(function(response) {
        $scope.surveyResponses.push(response.data.map(e => e.surveyId)[0]);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveSurveys() {

    let url = `/api/surveys/clients/${$rootScope.client.job}`;

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
