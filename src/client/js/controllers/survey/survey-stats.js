function SurveyStatsController($scope, $state, $http, $stateParams, $window, commonFactory) {

  initalizeController();


  function initalizeController() {
    retrieveStats();
    $scope.services = [];
    $scope.charts = [];
  }

  function buildStats(data) {
    let allResults = [];
    data.forEach(response => {
      allResults = response.results.reduce((coll, item) => {
        coll.push(item);
        return coll;
      }, allResults);
    });

    // processAllQuestions(allResults);
    processServiceGlobal(allResults);
  }

  function processServiceGlobal(allResults) {
    let groupedService = commonFactory.groupBy(allResults, 'service');
    console.log(groupedService);

    Object.keys(groupedService).map((service) => {

      let result = {
        service: service != 'undefined' ? service : 'Otros',
        charts: []
      }

      let groupedQuestions = commonFactory.groupBy(groupedService[service], 'question');
      Object.keys(groupedQuestions).map((key) => {
        const questions = groupedQuestions[key];
        let chart = processQuestions(questions);
        result.charts.push(chart);
      });

      $scope.services.push(result);
    });

    console.log($scope.services);
  }


  function processAllQuestions(allResults) {
    let groupedQuestions = commonFactory.groupBy(allResults, 'question');

    Object.keys(groupedQuestions).map((key) => {
      const questions = groupedQuestions[key];
      let chart = processQuestions(questions);
      $scope.charts.push(chart);
    });
  }

  function processQuestions(questions) {
    let chart = {};

    let answers = new Map();
    questions.map((e) => {

      chart.question = e.question;
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
        });

      if (e.formType === 'rating') {
        e.rates.forEach(rate => {
          if (!answers.has(rate.toString())) {
            answers.set(rate.toString(), 0);
          }
        });

        answers = new Map([...answers.entries()].sort());
      }
    });

    chart.labels = [...answers.keys()];
    chart.data = [...answers.values()];

    return chart;
  }

  $scope.retrieveClass = function(question) {
    if (question.formType === 'radiogroup' || question.formType === 'dropdown') {
      return 'chart-pie';
    } else if (question.formType === 'text' || question.formType === 'comment') {
      return 'chart-text';
    } else {
      return 'chart-bar';
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

  let tooltip = {
    callbacks: {
      label: function(tooltipItem, data) {
        let dataset = data.datasets[tooltipItem.datasetIndex];
        let total = dataset.data.reduce(function(previousValue, currentValue, currentIndex, array) {
          return previousValue + currentValue;
        });
        let currentValue = dataset.data[tooltipItem.index];
        let precentage = Math.floor(((currentValue / total) * 100) + 0.5);
        return currentValue + " - " + precentage + "%";
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


  $scope.pieOptions = {
    tooltips: tooltip
  };

  function retrieveStats() {
    $http.get('/api/surveys/' + $stateParams.id + '/responses/')
      .then(function(response) {
        buildStats(response.data);
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

SurveyStatsController.$inject = ['$scope', '$state', '$http', '$stateParams', '$window', 'commonFactory'];
angular.module('app').controller('surveyStatsController', SurveyStatsController);
