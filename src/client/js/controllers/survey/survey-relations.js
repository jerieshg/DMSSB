function SurveyRelationsController($scope, $state, $http, $stateParams, $window, commonFactory) {

  initalizeController();

  // RELATED TO RELATIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.retrieveServices = function() {
    retrieveServices();
    retrieveJobs();
  }

  //SAVE
  $scope.saveSurvey = function(valid) {
    if (valid) {

      if (!$scope.survey.update) {
        $scope.survey.created = new Date();
        $http.post("/api/surveys/", $scope.survey)
          .then(function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'success');
          })
          .catch(function(error) {
            console.log(error);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          });
      } else {

        $http.put("/api/surveys/" + $scope.survey._id, $scope.survey)
          .then(function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'info');
          })
          .catch(function(error) {
            console.log(error);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          });
      }
    } else {
      commonFactory.activateAlert('Por favor verifique la encuesta!', 'danger');
    }
  }


  //HELPER FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.goToBuilder = function() {
    if ($scope.survey.update) {
      $state.go('app.survey-builder.edit', {
        'id': $scope.survey._id,
        'survey': $scope.survey
      });
    } else {
      $state.go('app.survey-builder.create', {
        'survey': $scope.survey
      });
    }

  }

  function initalizeController() {
    $scope.survey = $stateParams.survey;
    if (!$scope.survey) {
      $window.history.back();
    }
  }

  function retrieveServices() {
    if ($scope.survey) {
      let url = '/api/services/departments/' + $scope.survey.department;
      $http.get(url)
        .then(function(response) {
          $scope.services = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  function retrieveJobs() {
    if ($scope.survey) {
      $http.get('/api/jobs/')
        .then(function(response) {
          $scope.jobs = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
}

SurveyRelationsController.$inject = ['$scope', '$state', '$http', '$stateParams', '$window', 'commonFactory'];
angular.module('app').controller('surveyRelationsController', SurveyRelationsController);
