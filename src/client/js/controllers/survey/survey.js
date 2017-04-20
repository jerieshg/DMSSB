function SurveyController($rootScope, $scope, $http, commonFactory) {

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
    $http.get(`/api/surveys/responses/client/${$rootScope.client._id}`)
      .then(function(response) {
        $scope.surveyResponses = response.data.map(e => e.surveyId);
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
      url = `/api/surveys/department/${$rootScope.client.department}/clients/${$rootScope.client.job}`;
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
