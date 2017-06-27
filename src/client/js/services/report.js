(function() {

  function reports($http, commonFactory) {

    var documentaryCenterReport = function(data) {
      return $http.post(`/api/reports/documentary-center/`, data)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var evaluateRequestStepReport = function(data) {
      return $http.post('/api/reports/evalute-request-step/', data)
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
      documentaryCenterReport: documentaryCenterReport,
      evaluateRequestStepReport: evaluateRequestStepReport
    };
  }

  reports.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('reports', reports);
})();
