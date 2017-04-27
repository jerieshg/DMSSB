function SurveyBuilderController($rootScope, $scope, $state, $http, $stateParams, commonFactory) {

  initalizeController();

  $scope.activeSurvey = function() {
    $scope.survey.active = !$scope.survey.active;
  }

  $scope.copyQuestion = function() {
    if (!$scope.newQuestion.update) {
      $scope.addQuestionToList(true);
    }

    $scope.questionCopy = angular.copy($scope.newQuestion);
  }

  $scope.pasteQuestion = function() {
    $scope.updateQuestion($scope.questionCopy, 0);
    $scope.newQuestion.update = false;
  }

  // NAVIGATION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.goToRelations = function(valid) {
    if (valid) {
      $state.go('app.survey-builder.relations', {
        'survey': $scope.survey
      });
    } else {
      commonFactory.activateAlert('Por favor verifique la encuesta!', 'danger');
    }
  }

  //SAVE
  $scope.saveSurvey = function(valid) {
    if (valid) {
      if (!$scope.survey.update) {
        $scope.survey.created = new Date();
        $http.post("/api/surveys/", $scope.survey)
          .then(function(response) {
            // success callback
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'success');
          })
          .catch(function(error) {
            console.log(error);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          });
      } else {
        $http.put("/api/surveys/" + $scope.survey._id, $scope.survey)
          .then(function(response) {
            $scope.survey = response.data;
            $scope.survey.update = true;
            commonFactory.activateAlert('Encuesta fue guardada exitosamente!', 'info');
          })
          .catch(function(error) {
            console.log(error);
            commonFactory.activateAlert('Woops! Algo paso!', 'danger');
          });
      }
    } else {
      commonFactory.activateAlert('Por favor verifique la encuesta!', 'danger');
    }
  }

  // RELATED TO RELATIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.retrieveServices = function() {
    retrieveServices();
  }

  // QUESTION EDIT & UPDATE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.deleteQuestion = function(name) {
    if (confirm("Esta seguro de borrar esta pregunta?")) {
      //looks for the name
      let removeIndex = commonFactory.indexInArray($scope.survey.questions, name);
      //if found delete it
      ~removeIndex && $scope.survey.questions.splice(removeIndex, 1);
    }
  }

  $scope.updateQuestion = function(question, index) {
    $scope.newQuestion = angular.copy(question);
    $scope.newQuestion.update = true;
    $scope.updateText = index;

    if ($scope.newQuestion.showChoices) {
      $scope.choices.number = $scope.newQuestion.choices.length;
      for (let [index, value] of $scope.newQuestion.choices.entries()) {
        $scope.selectedChoices[index] = {
          text: value,
          value: $scope.newQuestion.choicesValue[index].value * 100
        };
      }
    }

    if ($scope.newQuestion.formType === 'rating') {
      $scope.linearScale.selectedStart = $scope.newQuestion.rateValues[0];
      $scope.linearScale.selectedEnd = $scope.newQuestion.rateValues[$scope.newQuestion.rateValues.length - 1];
      $scope.linearScale.minRateDescr = $scope.newQuestion.mininumRateDescription;
      $scope.linearScale.maxRateDescr = $scope.newQuestion.maximumRateDescription;
    }

  }

  //SURVEY JS - QUESTION INFORMATION - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
  $scope.addQuestionToList = function(copy) {
    // For dropdown, checkbox, multiple choice, radio buttons
    if ($scope.newQuestion.showChoices && $scope.selectedChoices) {
      $scope.newQuestion.choices = $scope.selectedChoices.map(e => {
        return e.text;
      });
      $scope.selectedChoices.forEach((e) => {
        e.value = e.value / 100;
      })
      $scope.newQuestion.choicesValue = $scope.selectedChoices;
    }

    //for linear scale only
    if ($scope.newQuestion.formType === 'rating') {
      $scope.newQuestion.rateValues = commonFactory.generateNumberArray($scope.linearScale.selectedStart, $scope.linearScale.selectedEnd);
      $scope.newQuestion.mininumRateDescription = ($scope.linearScale.minRateDescr) ? $scope.linearScale.minRateDescr : 'No Satisfecho';
      $scope.newQuestion.maximumRateDescription = ($scope.linearScale.maxRateDescr) ? $scope.linearScale.maxRateDescr : 'Completamente Satisfecho';
    }

    //Cannot save 'type' in mongodb
    if (!copy) {
      $scope.newQuestion.type = $scope.newQuestion.formType;
      if ($scope.newQuestion.update) {
        updateQuestionInArray();
      } else {
        $scope.newQuestion.name = $scope.newQuestion.title;
        $scope.survey.questions.push(angular.copy($scope.newQuestion));
      }
      $scope.clearQuestion();
    }
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
    $scope.questionCopy = {};
    $scope.surveyForm = {};
    $scope.choices = {};
    $scope.business = {};
    $scope.clients = {};
    $scope.departments = {};
    $scope.selectedChoices = [{}];
    $scope.linearScale = {};

    $scope.survey = $scope.survey || {
      questions: [],
      department: $rootScope.client.department,
      active: true
    };

    retrieveBusiness();
    retrieveClients();
    retrieveDepartments();

    $scope.choiceOptions = commonFactory.generateNumberArray(1, 20);
    $scope.linearScaleStart = commonFactory.generateNumberArray(0, 1);
    $scope.linearScaleEnd = commonFactory.generateNumberArray(2, 10);

    if ($stateParams.survey) {
      $scope.survey = $stateParams.survey;
    } else if ($stateParams.id) {
      $http.get('/api/surveys/' + $stateParams.id)
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
      .then(function(response) {
        $scope.business = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveClients() {
    $http.get('/api/clients/')
      .then(function(response) {
        $scope.clients = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDepartments() {
    $http.get('/api/departments/')
      .then(function(response) {
        $scope.departments = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  $scope.clearQuestion = function() {
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

SurveyBuilderController.$inject = ['$rootScope', '$scope', '$state', '$http', '$stateParams', 'commonFactory'];
angular.module('app').controller('surveyBuilderController', SurveyBuilderController);
