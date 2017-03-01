function SurveyStatsController($scope, $state, $http, $stateParams, $window, commonFactory) {

  initalizeController();

  function initalizeController() {
    $scope.isComparing = $state.includes('app.survey-builder.compare-stats');
    let seriesCurrentName = "";

    if ($scope.isComparing) {
      if (!$stateParams.surveyIds) {
        $window.history.back();
        return;
      }

      retrieveAllStats();
    } else {
      retrieveSurvey();
      retrieveStats();
    }

    configureTooltipOptions();
    $scope.survey = {};
    $scope.services = [];
    $scope.totalResult = new Map();
    $scope.radarGraph = {
      labels: [],
      data: [],
      series: []
    };
    $scope.actionPlan = {
      percentage: 0,
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
    let chart = {
      series: [],
      data: []
    };

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

    let found = false;

    if ($scope.isComparing) {

      chart.series.push(seriesCurrentName);

      //trying to look for existing service
      $scope.services.forEach((service) => {
        let foundService = service.charts.find((s) => {
          return s.question === chart.question;
        });

        console.log(foundService);
        //if found, update
        if (foundService) {
          foundService.series.push(seriesCurrentName);
          foundService.data.push([...answers.values()])
          found = true;
          break;
        }
      });

      //if not found, add it to the lese
      if (!found) {
        chart.labels = [...answers.keys()];
        chart.data.push([...answers.values()]);
        chart.average = (selectedQuestion.average * 100).toFixed(2);
      }
    } else {
      chart.labels = [...answers.keys()];
      chart.data.push([...answers.values()]);
      chart.average = (selectedQuestion.average * 100).toFixed(2);
    }

    // chart.average = (selectedQuestion.average * 100).toFixed(2);
    selectedQuestion.percentage = chart.average;

    return !found ? chart : null;
  }

  function buildRadarMap() {
    let data = [];
    for (var [key, value] of $scope.totalResult.entries()) {
      if ($scope.radarGraph.labels.indexOf(key) === -1) {
        $scope.radarGraph.labels.push(key);
      }

      let totalSum = 0;
      let length = 0;
      value.forEach((e) => {
        if (e.formType !== 'text' && e.formType !== 'comment') {
          totalSum += e.average;
          length++;
        }
      });

      data.push(((totalSum / length) * 100).toFixed(2));
    }
    if ($scope.isComparing) {
      $scope.radarGraph.series.push(seriesCurrentName);
    }
    $scope.radarGraph.data.push(data);
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

  function retrieveAllStats() {
    Object.keys($stateParams.surveyIds).map((key) => {
      const surveyObj = $stateParams.surveyIds[key];

      $http.get('/api/surveys/' + surveyObj._id + '/responses/')
        .then(function(response) {
          seriesCurrentName = surveyObj.surveyName;
          buildStats(response.data);
          console.log("-----------")
            // $scope.services = [];
        })
        .catch(function(error) {
          console.log(error);
        });
    });
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
