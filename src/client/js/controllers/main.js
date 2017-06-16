function MainController($rootScope, $scope, $state, $http, $q, commonFactory, surveyResponse) {

  initializeController();

  $scope.findMissing = function(job) {
    $http.get(`/api/survey-responses/${$scope.trackingSurvey._id}/job/${job}/`)
      .then(function(response) {
        console.log(response);
        $scope.missingClients = response.data;
      })
      .catch(function(error) {
        console.log(error);
        commonFactory.toastMessage('Woops! Algo paso!', 'danger');
      });
  }


  $scope.duplicateSurvey = function(survey) {
    if (commonFactory.dialog("Esta seguro que quiere duplicar esta encuesta?")) {
      let duplicate = angular.copy(survey);
      delete duplicate._id;
      delete duplicate._v;
      duplicate.finalGrade = 0;
      duplicate.created = new Date();

      $http.post("/api/surveys/", duplicate)
        .then(function(response) {
          retrieveSurveys();
          commonFactory.toastMessage('Encuesta fue duplicada exitosamente!', 'success');
        })
        .catch(function(error) {
          console.log(error);
          commonFactory.toastMessage('Woops! Algo paso!', 'danger');
        });
    }
  }

  $scope.exportAllSurveys = function() {
    let test = {};
    let promises = [];

    $scope.surveys.forEach(e => {
      promises.push($http.get(`/api/surveys/${e._id}/track/general/${e.general}`));
    });

    $q.all(promises).then(function(result) {
      $http({
          url: '/api/excel-surveys/',
          method: "POST",
          responseType: 'blob',
          data: result.map(e => e.data)
        }).then(function(response) {
          var blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats'
          });

          saveAs(blob, "reporte_" + new Date() + ".xlsx");
        })
        .catch(function(error) {
          commonFactory.activateAlert('Woops! Algo paso!', 'danger');
        });
    });
  }

  $scope.compareSurveys = function() {
    if (Object.keys($scope.surveyCompareList).length > 1) {
      $state.go('app.survey-builder.compare-stats', {
        'surveyIds': $scope.surveyCompareList
      });
    } else {
      commonFactory.toastMessage('No ha elegido encuestas a comparar', 'info');
    }
  }

  $scope.addToCompareSurvey = function(value, survey) {
    if (value) {
      $scope.surveyCompareList[survey._id] = {
        surveyName: survey.surveyName,
        _id: survey._id
      }
    } else {
      delete $scope.surveyCompareList[survey._id];
    }
  }

  $scope.trackSurvey = function(survey) {
    $scope.trackingSurvey = survey;

    $http.get(`/api/surveys/${survey._id}/track/general/${survey.general}`)
      .then((response) => {
        $scope.trackUsers = response.data;
      })
      .catch((error) => {
        console.log(error);
      })
  }

  $scope.calculateTotal = function(current, total) {
    let result = 0;

    if (current && current > 0) {
      result = current / total;
    }

    return result * 100;
  }

  $scope.deleteSurvey = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar esta encuesta?")) {
      $http.delete("/api/surveys/" + id)
        .then(function(response) {
          // success callback
          commonFactory.toastMessage('Encuesta fue borrada exitosamente!', 'info');
          retrieveSurveys();
        })
        .catch(function(error) {
          commonFactory.toastMessage('Woops! Algo paso!', 'danger');
        });
    }
  }

  function initializeController() {
    retrieveSurveys();
    $scope.surveyCompareList = [];
    $scope.surveyCount = {};
    $scope.trackingSurvey = {};
  }

  function findResponseCount(ids) {
    surveyResponse.countSurvey(ids)
      .then(response => {
        response.data.forEach(e => {
          $scope.surveyCount[e._id] = e.count;
        });
      });
  }

  function retrieveSurveys() {
    let url = '/api/surveys/';

    if ($rootScope.client.role.level === 2) {
      url = `/api/surveys/department/${$rootScope.client.department}/`;
    }

    $http.get(url)
      .then(function(response) {
        $scope.surveys = response.data;
        findResponseCount($scope.surveys.map(e => e._id));
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

MainController.$inject = ['$rootScope', '$scope', '$state', '$http', '$q', 'commonFactory', 'surveyResponse'];
angular.module('app').controller('mainController', MainController);
