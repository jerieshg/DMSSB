function SurveyBuilderController($scope, $state, $http, $stateParams, commonFactory) {

  initalizeController();

  //SAVE
  $scope.saveSurvey = function() {

    if (!$scope.survey.update) {
      $scope.survey.created = new Date();
      $http.post("/api/surveys/", $scope.survey)
        .then(
          function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'success');
          },
          function(response) {
            // failure callback
            console.log(response);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          }
        );
    } else {
      $http.put("/api/surveys/" + $scope.survey._id, $scope.survey)
        .then(
          function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'info');
          },
          function(response) {
            // failure callback
            console.log(response);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          }
        );
    }

  }

  // NAVIGATION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.goToRelations = function() {
    $state.transitionTo('app.survey-builder.relations');
  }

  // RELATED TO RELATIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.retrieveServices = function() {
    retrieveServices();
  }

  // QUESTION EDIT & UPDATE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.deleteQuestion = function(name) {
    //looks for the name
    let removeIndex = commonFactory.indexInArray($scope.survey.questions, name);
    //if found delete it
    ~removeIndex && $scope.survey.questions.splice(removeIndex, 1);
    //updates survey
  }

  $scope.updateQuestion = function(question) {
    $scope.newQuestion = angular.copy(question);
    $scope.newQuestion.update = true;
  }

  //SURVEY JS - QUESTION INFORMATION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.addQuestionToList = function() {
    // For dropdown, checkbox, multiple choice, radio buttons
    if ($scope.newQuestion.showChoices && $scope.selectedChoices) {
      $scope.newQuestion.choices = $scope.selectedChoices.map(e => {
        return e.text;
      });
      $scope.newQuestion.choicesValue = $scope.selectedChoices;
    }

    //for linear scale only
    if ($scope.newQuestion.formType === 'rating') {
      $scope.newQuestion.rateValues = commonFactory.generateNumberArray($scope.linearScale.selectedStart.label, $scope.linearScale.selectedEnd.label);
      $scope.newQuestion.mininumRateDescription = ($scope.linearScale.minRateDescr) ? $scope.linearScale.minRateDescr : 'No Satisfecho';
      $scope.newQuestion.maximumRateDescription = ($scope.linearScale.maxRateDescr) ? $scope.linearScale.maxRateDescr : 'Completamente Satisfecho';
    }

    //Cannot save 'type' in mongodb
    $scope.newQuestion.type = $scope.newQuestion.formType;
    if ($scope.newQuestion.update) {
      updateQuestionInArray();
    } else {
      $scope.newQuestion.name = $scope.newQuestion.title;
      $scope.survey.questions.push(angular.copy($scope.newQuestion));
    }

    clearQuestion();
  };

  $scope.onQuestionTypeChange = function() {
    switch ($scope.newQuestion.formType) {
      case undefined:
      case 'text':
      case 'comment':
        $scope.newQuestion.showChoices = false;
        break;
      case 'rating':
        $scope.newQuestion.showChoices = false;
        $scope.linearScaleStart = commonFactory.generateNumber(0, 1);
        $scope.linearScaleEnd = commonFactory.generateNumber(2, 10);
        $scope.linearScale.selectedStart = $scope.linearScaleStart[0]
        $scope.linearScale.selectedEnd = $scope.linearScaleEnd[0]
        break;
      default:
        $scope.newQuestion.showChoices = true;
        $scope.linearScale = {};
        break;
    }
  };

  //HELPER FUNCTIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
   function initalizeController() {
    $scope.choices = {};
    $scope.business = {};
    $scope.clients = {};
    $scope.departments = {};
    $scope.selectedChoices = [{}];
    $scope.linearScale = {};

    $scope.survey = $scope.survey || {
      questions: []
    };
    clearQuestion();
    retrieveBusiness();
    retrieveClients();
    retrieveDepartments();

    $scope.choiceOptions = commonFactory.generateNumberArray(1, 20);

    let id = $stateParams.id;

    if (id) {
      $http.get('/api/surveys/' + id)
        .then(
          function(response) {
            $scope.survey = response.data;
            $scope.survey.update = true;
          },
          function(response) {
            console.log(response);
          }
        );
    }
  }

  function retrieveBusiness() {
    $http.get('/api/business/')
      .then(
        function(response) {
          $scope.business = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function retrieveClients() {
    $http.get('/api/clients/')
      .then(
        function(response) {
          $scope.clients = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function retrieveDepartments() {
    $http.get('/api/departments/')
      .then(
        function(response) {
          $scope.departments = response.data;
        },
        function(response) {
          console.log(response);
        }
      );
  }

  function retrieveServices() {
    if ($scope.survey.department) {
      let url = '/api/services/' + $scope.survey.department + '/department/';
      $http.get(url)
        .then(
          function(response) {
            $scope.services = response.data;
          },
          function(response) {
            console.log(response);
          }
        );
    }
  }

  function clearQuestion() {
    $scope.selectedChoices = [{}];
    $scope.linearScale = {};
    $scope.newQuestion = {
      name: '',
      title: '',
      type: 'text',
      isRequired: false,
      inputType: '',
      choices: [],
      showChoices: false
    }
  }

  function updateQuestionInArray() {
    //looks for the name
    let updateIndex = commonFactory.indexInArray($scope.survey.questions, $scope.newQuestion.name);
    //if found update it
    if (updateIndex !== -1) {
      $scope.survey.questions[updateIndex] = angular.copy($scope.newQuestion);
    }
  }
}

let app = angular.module('app')
SurveyBuilderController.$inject = ['$scope', '$state', '$http', '$stateParams', 'commonFactory'];
app.controller('surveyBuilderController', SurveyBuilderController);

app.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i = 0; i < total; i++)
      input.push(i);
    return input;
  };
})
