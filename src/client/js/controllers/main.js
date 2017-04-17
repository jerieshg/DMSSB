function MainController($rootScope, $scope, $state, $http, commonFactory) {

  initializeController();

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

  $scope.trackSurvey = function(id) {
    $http.get(`/api/surveys/${id}/track/`)
      .then((response) => {
        $scope.trackUsers = response.data;
      })
      .catch((error) => {
        console.log(error);
      })
  }

  $scope.generateActionPlan = function() {
    $http.get(`/api/surveys/${$scope.apId}/responses/`)
      .then(function(response) {
        buildStats(response.data);
        if ($scope.actionPlan.items.length !== 0) {
          let percentages = $scope.actionPlan.items.map(e => e.percentage / 100);
          $scope.actionPlan.finalGrade = (((percentages.reduce((a, b) => +a + +b)) / percentages.length) * 100).toFixed(2);

          downloadActionPlan();
        } else {
          commonFactory.toastMessage('No hay respuestas o no hay preguntas dentro del rango para generar plan de acción', 'danger');
        }
      })
      .catch(function(error) {
        console.log(error);
      });

    $("#actionPlanModal").modal('toggle');
  }

  function downloadActionPlan() {
    $scope.actionPlan.items = commonFactory.groupBy($scope.actionPlan.items, 'service');

    $http.post('/api/excel/', $scope.actionPlan, {
        responseType: 'blob'
      })
      .then(function(response) {
        var blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats'
        });

        saveAs(blob, "planDeAccion_" + new Date() + ".xlsx");
        $scope.actionPlan.items = [];
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function buildStats(data) {
    let allResults = [];
    $scope.totalResponses = data.length;
    $scope.actionPlan.totalResponses = $scope.totalResponses;

    data.forEach(response => {
      allResults = response.results.reduce((coll, item) => {
        coll.push(item);
        return coll;
      }, allResults);
    });

    processServiceGlobal(allResults);
  }

  function processServiceGlobal(allResults) {
    let groupedService = commonFactory.groupBy(allResults, 'service');

    Object.keys(groupedService).map((service) => {

      let groupedQuestions = commonFactory.groupBy(groupedService[service], 'question');
      Object.keys(groupedQuestions).map((key) => {
        const questions = groupedQuestions[key];
        let chart = processQuestions(questions);
      });
    });
  }

  function processQuestions(questions) {

    let selectedQuestion = {
      average: 0
    }

    let answers = new Map();
    let values = [];

    questions.map((e) => {
      let answerSum = 0;
      selectedQuestion.question = e.question;
      selectedQuestion.service = e.service;

      e.answer.split(',').map(
        (answer) => {
          if (!answers.has(answer)) {
            answers.set(answer, 1);
          } else {
            let count = answers.get(answer);
            answers.set(answer, count + 1);
          }

          if (e.formType === 'rating') {
            answerSum += answer;
          }
        });

      if (e.formType === 'rating') {
        let maxValue = e.rates[e.rates.length - 1];
        let average = (answerSum / $scope.totalResponses) / maxValue;
        selectedQuestion.average += average;
        selectedQuestion.rating = true;
      }
    });

    if (!selectedQuestion.rating) {
      selectedQuestion.average = (questions.map((e) => Number.parseFloat(e.value)).reduce((a, b) => a + b)) / $scope.totalResponses;
    }

    selectedQuestion.percentage = (selectedQuestion.average * 100).toFixed(2);

    if (selectedQuestion.percentage <= $scope.actionPlan.percentage) {
      selectedQuestion.responses = questions.length;
      $scope.actionPlan.items.push(selectedQuestion);
    }
  }

  $scope.setActionPlan = function(id) {
    $scope.apId = id;
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
    $scope.actionPlan = {
      percentage: 0,
      items: []
    };
    $scope.surveyCompareList = [];
  }

  function retrieveSurveys() {
    let url = '/api/surveys/';

    if ($rootScope.client.role.level === 2) {
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

MainController.$inject = ['$rootScope', '$scope', '$state', '$http', 'commonFactory'];
angular.module('app').controller('mainController', MainController);
