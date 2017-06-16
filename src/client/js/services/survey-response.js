(function() {

  function SurveyResponses($http, commonFactory) {

    var findByClient = function(id) {
      return $http.get(`/api/surveys/responses/client/${id}`)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    }

    var countSurvey = function(ids) {
      return $http.post(`/api/surveys/count/`, ids)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    return {
      countSurvey: countSurvey,
      findByClient: findByClient
    };
  }

  SurveyResponses.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('surveyResponse', SurveyResponses);
})();
