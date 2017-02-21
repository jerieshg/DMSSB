function SurveyStatsController($scope, $state, $http, $stateParams, $window, commonFactory) {

  initalizeController();

  function initalizeController() {
    retrieveSurvey();
    retrieveStats();
    configureTooltipOptions();
    $scope.survey = {};
    $scope.services = [];
    $scope.totalResult = new Map();
    $scope.radarGraph = {
      labels: [],
      data: []
    };
    $scope.actionPlan = {
      percentage: 50,
      items: []
    };
    $scope.totalResponses = 0;
  }

  $scope.generateActionPlan = function() {
    $scope.services.forEach((service) => {
      service.charts.forEach((e) => {
        if (e.average <= $scope.actionPlan.percentage) {
          let item = {
            service: service.service,
            question: e.question,
            percentage: e.average
          };
          $scope.actionPlan.items.push(item);
        }
      });
    })
    
    $scope.actionPlan.items = commonFactory.groupBy($scope.actionPlan.items, 'service');
    if ($scope.actionPlan.items.length === 0) {
      $("#actionPlanModal").modal('toggle');
      alert('No hay respuestas o no hay preguntas dentro del rango para generar plan de acción');
      return;
    }

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

    $("#actionPlanModal").modal('toggle');
  }

  $scope.setActionPlan = function(id) {
    $scope.apId = id;
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

  $scope.exportAllResponses = function() {
    $http({
        url: `/api/excel/${$stateParams.id}`,
        method: "GET",
        responseType: 'blob'
      }).then(function(response) {
        var blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats'
        });

        saveAs(blob, "archivo_" + new Date() + ".xlsx");
      })
      .catch(function(error) {
        commonFactory.activateAlert('Woops! Algo paso!', 'danger');
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

      let result = {
        service: service != 'undefined' ? service : 'Otros',
        charts: []
      }

      let groupedQuestions = commonFactory.groupBy(groupedService[service], 'question');
      Object.keys(groupedQuestions).map((key) => {
        const questions = groupedQuestions[key];
        let chart = processQuestions(questions, result);
        result.charts.push(chart);
      });

      $scope.services.push(result);
    });

    buildRadarMap();
  }

  function processQuestions(questions, result) {
    let chart = {};

    let selectedQuestion = {
      average: 0
    }

    let answers = new Map();
    let values = [];

    questions.map((e) => {
      let answerSum = 0;
      chart.question = e.question;
      selectedQuestion.formType = e.formType;
      //splits every answer
      e.answer.split(',').map(
        (answer) => {
          if (!answers.has(answer)) {
            chart.formType = e.formType;
            answers.set(answer, 1);
          } else {
            let count = answers.get(answer);
            answers.set(answer, count + 1);
          }

          if (e.formType === 'rating') {
            answerSum += answer;
          }
        });
      //Ends with the answer
      selectedQuestion.service = e.service;
      if (e.formType === 'rating') {
        //Set 0 to each rate
        e.rates.forEach(rate => {
          if (!answers.has(rate.toString())) {
            answers.set(rate.toString(), 0);
          }
        });
        answers = new Map([...answers.entries()].sort());

        // //calculate average
        let maxValue = e.rates[e.rates.length - 1];
        let average = (answerSum / $scope.totalResponses) / maxValue;
        selectedQuestion.average += average;
        selectedQuestion.rating = true;
      }


    });

    selectedQuestion.question = chart.question;

    if (!selectedQuestion.rating) {
      selectedQuestion.average = (questions.map((e) => Number.parseFloat(e.value)).reduce((a, b) => a + b)) / $scope.totalResponses;
    }

    let resultSet = $scope.totalResult.get(selectedQuestion.service) ? $scope.totalResult.get(selectedQuestion.service) : [];
    resultSet.push(selectedQuestion);
    $scope.totalResult.set(selectedQuestion.service, resultSet);

    chart.labels = [...answers.keys()];
    chart.data = [...answers.values()];
    chart.average = (selectedQuestion.average * 100).toFixed(2);
    selectedQuestion.percentage = chart.average;

    return chart;
  }

  function buildRadarMap() {
    for (var [key, value] of $scope.totalResult.entries()) {
      $scope.radarGraph.labels.push(key);

      let totalSum = 0;
      let length = 0;
      value.forEach((e) => {
        if (e.formType !== 'text' && e.formType !== 'comment') {
          totalSum += e.average;
          length++;
        }
      });

      $scope.radarGraph.data.push(((totalSum / length) * 100).toFixed(2));
    }
  }

  $scope.showChartType = function(questionType, chartType) {

    if (chartType === 'pie' && (questionType === 'radiogroup' || questionType === 'dropdown')) {
      return true;
    } else if (chartType === 'text' && (questionType === 'text' || questionType === 'comment')) {
      return true;
    } else if (chartType === 'bar' && (questionType === 'rating')) {
      return true;
    } else if (chartType === 'horizontal-bar' && (questionType === 'checkbox')) {
      return true;
    } else {
      return false;
    }
  }

  function configureTooltipOptions() {
    let tooltip = {
      callbacks: {
        label: function(tooltipItem, data) {
          let dataset = data.datasets[tooltipItem.datasetIndex];
          let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
            return previousValue + currentValue;
          });
          let currentValue = dataset.data[tooltipItem.index];
          let percentage = Math.floor(((currentValue / total) * 100) + 0.5);
          return currentValue + " - " + percentage + "%";
        }
      }
    }

    $scope.options = {
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            beginAtZero: true,
            min: 0
          }
        }]
      },
      tooltips: tooltip
    };

    $scope.horizontalBarOptions = {
      scales: {
        xAxes: [{
          display: true,
          ticks: {
            beginAtZero: true,
            min: 0
          }
        }]
      },
      tooltips: tooltip
    };

    $scope.radarOptions = {
      scale: {
        ticks: {
          min: 0,
          max: 100
        }
      }
    };

    $scope.pieOptions = {
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            let dataset = data.datasets[tooltipItem.datasetIndex];

            let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
              return previousValue + currentValue;
            });
            let currentValue = dataset.data[tooltipItem.index];

            let percentage = Math.floor(((currentValue / total) * 100) + 0.5);

            return data.labels[tooltipItem.index] + " - " + percentage + "%";
          }
        }
      }
    };
  }

  function retrieveStats() {
    $http.get('/api/surveys/' + $stateParams.id + '/responses/')
      .then(function(response) {
        buildStats(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveSurvey() {
    $http.get(`/api/surveys/${$stateParams.id}`)
      .then(function(response) {
        $scope.survey = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

SurveyStatsController.$inject = ['$scope', '$state', '$http', '$stateParams', '$window', 'commonFactory'];
angular.module('app').controller('surveyStatsController', SurveyStatsController);
