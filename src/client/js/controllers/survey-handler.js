function SurveyHandlerController($scope, $http, $stateParams, commonFactory) {

  initializeController();

  function initializeController() {
    generateSurvey();
  }

  function generateSurvey() {
    $http.get('/api/surveys/' + $stateParams.id + '/client/' + $stateParams.client + '/')
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

    const survey = {};
    
    data.questions = data.questions.map(question => {
      question.type = question.formType;
      return question;
    });

    var surveyModel = new Survey.Model({
      questions: data.questions
    });

    // $(".survey").Survey({
    //   model: surveyModel
    // });
  }

}

SurveyHandlerController.$inject = ['$scope', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('surveyHandlerController', SurveyHandlerController);
