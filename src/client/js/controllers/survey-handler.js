function SurveyHandlerController($rootScope, $scope, $http, $stateParams, commonFactory) {

  initializeController();

  function initializeController() {

    generateSurvey();
  }

  function surveyOnComplete(sender){
    let completedSurvey = sender;
    let data = completedSurvey.data;
  }

  function generateSurvey() {
    let client = $rootScope.client;
    let url = '/api/surveys/' + $stateParams.id + '/client/' + $stateParams.client + '/';

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
      onComplete: surveyOnComplete
    });
  }

}

SurveyHandlerController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('surveyHandlerController', SurveyHandlerController);
