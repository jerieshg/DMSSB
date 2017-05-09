function SurveyStatsController($scope, $state, $http, $stateParams, $window, commonFactory) {

  initalizeController();

  function initalizeController() {
    $scope.finalGrade = 0;
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
    $scope.clients = [];
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

  $scope.print = function() {
    let doc = new jsPDF();
    let canvasElements = [];

    $('canvas').map((index, item) => {
      canvasElements.push({
        service: item.getAttribute('data-service'),
        dataURL: item.toDataURL(),
        question: item.getAttribute('data-question'),
        result: item.getAttribute('data-result')
      })
    });

    $scope.services.forEach((service) => {
      service.charts.forEach((e) => {
        if ($scope.showChartType(e.formType, 'text')) {

          canvasElements.push({
            service: service.service,
            question: e.question,
            answer: e.labels.join(",").replace(/,/g, "\n")
          });
        }
      });
    });

    let groupedCanvas = commonFactory.groupBy(canvasElements, 'service');

    Object.keys(groupedCanvas).map((service, serviceIndex) => {
      doc.setFontSize(18)
      let textTitle = (service && service !== "null") ? service : 'Resultado General';
      doc.text(textTitle, 75, 15);

      let position = 1
      groupedCanvas[service].forEach((item, index) => {
        let yImageCoord = 35;
        let yTextCoord = 25;
        let xSize = 170;
        let ySize = 80;

        if (position % 2 == 0) {
          yTextCoord = 135;
          yImageCoord = 145;
        }

        if (textTitle === 'Resultado General') {
          xSize = 180;
          ySize = 180;
        }

        if (item.question) {
          doc.setFontSize(10)
          let text = `${item.question} - ${item.result ? item.result : ''}`;
          let splittedText = doc.splitTextToSize(text, doc.internal.pageSize.width - 25);
          doc.text(splittedText, 15, yTextCoord);
        }

        if (!item.answer) {
          doc.addImage(item.dataURL, 'JPEG', 15, yImageCoord, xSize, ySize);
        } else {
          let splitAnswer = doc.splitTextToSize(item.answer, doc.internal.pageSize.width - 25);
          doc.text(splitAnswer, 15, yTextCoord + 10);
        }

        if (position % 2 == 0 && index + 1 !== groupedCanvas[service].length) {
          doc.addPage();
        }

        position++;
      });

      if (Object.keys(groupedCanvas).length !== serviceIndex + 1) {
        doc.addPage();
      }
    });

    doc.save(`resumen_graficos_${new Date()}.pdf`);
  }

  $scope.generateActionPlan = function() {
    $scope.services.forEach((service) => {

      service.charts.forEach((e) => {
        let isText = e.formType === 'text' || e.formType === 'comment';
        if (e.average <= $scope.actionPlan.percentage || isText) {

          let item = {
            formType: e.formType,
            service: service.service,
            question: e.question,
            percentage: e.average,
            responses: e.responses,
            textResponse: e.labels.join(", \n")
          };
          $scope.actionPlan.items.push(item);
        }
      });
    })

    $scope.actionPlan.finalGrade = ($scope.finalGrade * 100).toFixed(2);

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
    $scope.actionPlan.totalResponses = $scope.totalResponses;

    data.forEach(response => {
      allResults = response.results.reduce((coll, item) => {
        coll.push(item);
        return coll;
      }, allResults);
    });

    $scope.clients = $scope.clients.concat(data.map((e) => e.client));
    $scope.clients = $scope.clients.map(e => e.username);
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
        if (chart) {
          result.charts.push(chart);
        }
      });

      $scope.services.push(result);
    });

    buildRadarMap();
  }

  function processQuestions(questions, result) {
    let chart = {
      series: [],
      data: [],
      compareAverages: []
    };

    //Used for radar graph
    let selectedQuestion = {
      average: 0
    }

    let answers = new Map();
    let values = [];

    let answerSum = 0;
    let maxValue = 0;
    questions.map((e) => {

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
            answerSum += +answer;
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

        answers = new Map([...answers.entries()].sort((a, b) => {
          return a[0] - b[0];
        }));
        maxValue = e.rates[e.rates.length - 1];

        selectedQuestion.rating = true;
      }
    });

    selectedQuestion.question = chart.question;
    if (!selectedQuestion.rating) {
      selectedQuestion.average = (questions.map((e) => Number.parseFloat(e.value)).reduce((a, b) => a + b)) / questions.length;
    } else {
      selectedQuestion.average = (answerSum / questions.length) / maxValue;
    }

    //Result set used in radar graph
    let resultSet = $scope.totalResult.get(selectedQuestion.service) ? $scope.totalResult.get(selectedQuestion.service) : [];
    resultSet.push(selectedQuestion);
    $scope.totalResult.set(selectedQuestion.service, resultSet);

    chart.average = (selectedQuestion.average * 100).toFixed(2);
    chart.responses = questions.length;
    selectedQuestion.responses = questions.length;

    let found = false;
    if ($scope.isComparing) {
      chart.series.push(seriesCurrentName);

      //if comparing search for the existing service
      $scope.services.forEach((service) => {
        let foundIndex = 0;
        let foundService = service.charts.find((s, index) => {
          let equal = s.question.replace(/[^a-zA-Z]/g, "") === chart.question.replace(/[^a-zA-Z]/g, "");
          if (equal) {
            foundIndex = index;
          }

          return equal;
        });

        if (foundService) {
          foundService.data.push([...answers.values()])
          foundService.series.push(seriesCurrentName);
          foundService.compareAverages.push(chart.average);
          service.charts[foundIndex] = foundService;
          found = true;
        }
      });
    }

    if (!found) {
      chart.labels = [...answers.keys()];
      if (!$scope.isComparing) {
        chart.data = [...answers.values()];
      } else {
        chart.data.push([...answers.values()]);
      }

      chart.compareAverages.push(chart.average);
    }
    chart.average = isNaN(chart.average) ? 0.00 : chart.average;
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

      $scope.finalGrade += +(totalSum / length);
      data.push(((totalSum / length) * 100).toFixed(2));
    }
    if ($scope.isComparing) {
      $scope.radarGraph.series.push(seriesCurrentName);
    }

    $scope.finalGrade = $scope.finalGrade / (data.length);
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
          let label = (dataset.label ? dataset.label.substring(0, (dataset.label.length < 17 ? dataset.label.length : 17)) + " - " : "")
          return label + currentValue + " - " + percentage + "%";
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
      tooltips: tooltip,
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

        $http.post(`/api/surveys/${$stateParams.id}/grades/`, {
            finalGrade: $scope.finalGrade
          })
          .then((response) => {})
          .catch((error) => {
            console.log(error)
          });
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
angular.module('app', ['chart.js']).controller('surveyStatsController', SurveyStatsController);
