function MainController($rootScope, $scope, $http, commonFactory) {

  initializeController();

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
          downloadActionPlan();
        } else {
          commonFactory.activateAlert('No hay respuestas o no hay preguntas dentro del rango para generar plan de acción', 'danger');
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
      $scope.actionPlan.items.push(selectedQuestion);
    }
  }

  $scope.setActionPlan = function(id) {
    $scope.apId = id;
  }

  $scope.deleteSurvey = function(id) {
    $http.delete("/api/surveys/" + id)
      .then(function(response) {
        // success callback
        commonFactory.activateAlert('Encuesta fue borrada exitosamente!', 'info');
        retrieveSurveys();
      })
      .catch(function(error) {
        commonFactory.activateAlert('Woops! Algo paso!', 'danger');
      });

  }

  function initializeController() {
    retrieveSurveys();
    $scope.actionPlan = {
      percentage: 0,
      items: []
    };
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

MainController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory'];
angular.module('app').controller('mainController', MainController);
