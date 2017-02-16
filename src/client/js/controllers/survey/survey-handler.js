function SurveyHandlerController($rootScope, $scope, $http, $stateParams, commonFactory) {

  initializeController();

  function initializeController() {
    $scope.completeSurvey = {};
    generateSurvey();
  }

  function sendDataToServer(survey) {
    const data = survey.data;
    const response = {
      client: $rootScope.client.username,
      results: [],
      timestamp: new Date()
    };

    for (const question of Object.keys(data)) {
      //Gets selected question
      const selectedQuestions = $scope.completeSurvey.questions.filter(e => {
        return e.title === question;
      });

      //if no questions found, break the loop
      if (selectedQuestions.length === 0)
        break;

      //grabs the selected question
      const selectedQuestion = selectedQuestions[0];

      response.surveyId = $scope.completeSurvey._id;
      //builds response Object
      const result = {
        service: selectedQuestion.service,
        question: question,
        formType: selectedQuestion.formType,
        answer: data[question],
        rates: selectedQuestion.rateValues
      };

      //Questions that has a value
      if (selectedQuestion.formType === 'checkbox' || selectedQuestion.formType === 'dropdown' || selectedQuestion.formType === 'radiogroup') {
        const values = selectedQuestion.choicesValue.map(e => {
          return e.value;
        });
        if (data[question] instanceof Array) {
          result.answer = data[question].join();
          const answerValues = [];
          data[question].forEach(e => {
            answerValues.push(values[selectedQuestion.choices.indexOf(e)]);
          });
          result.value = answerValues.join();
        } else {
          result.value = values[selectedQuestion.choices.indexOf(data[question])] + '';
        }
      }

      response.results.push(result);
    }

    $http.post('/api/surveys/responses/', response)
      .then(
        function(response) {
          console.log(response);
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function generateSurvey() {
    let client = $rootScope.client;
    let url = '/api/surveys/' + $stateParams.id + '/clients/' + $stateParams.client + '/';

    if (client.role.role === 'Admin') {
      url = '/api/surveys/' + $stateParams.id;
    }
    
    $http.get(url)
      .then(
        function(response) {
          if (response.data) {
            buildSurvey(response.data);
          }
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function buildSurvey(data) {
    const survey = data;
    survey.questions = survey.questions.map(question => {
      question.type = question.formType;
      return question;
    });

    $scope.completeSurvey = survey;

    Survey.Survey.cssType = "bootstrap";
    var customCSS = {
      root: "survey-container",
      row: "row-separator",
      question: {
        root: "sv_q",
        title: "sv_q_title"
      },
      checkbox: {
        root: 'sv_q_checkbox'
      },
      radiogroup: {
        root: 'sv_q_radiogroup'
      },
      rating: {
        root: 'sv_q_rating',
        item: 'sv_q_rating_item'
      },
      navigationButton: "btn btn-block btn-success row-separator"
    };

    var surveyModel = new Survey.Model({
      questions: survey.questions
    });

    $(".survey").Survey({
      model: surveyModel,
      css: customCSS,
      onComplete: sendDataToServer
    });
  }

}

SurveyHandlerController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('surveyHandlerController', SurveyHandlerController);
