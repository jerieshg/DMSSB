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
      return $http.post('/api/reports/evaluate-request-step/', data)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var evaluateRejectedDocuments = function(data) {
      return $http.post('/api/reports/evaluate-rejected-documents/', data)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var evaluateDocumentsUnderReview = function(data) {
      return $http.post('/api/reports/evaluate-documents-review/', data)
        .then((response) => {
          return response;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var evaluateExpiredDocuments = function(data) {
      return $http.post('/api/reports/evaluate-expired-documents/', data)
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
      evaluateRequestStepReport: evaluateRequestStepReport,
      evaluateRejectedDocuments: evaluateRejectedDocuments,
      evaluateDocumentsUnderReview: evaluateDocumentsUnderReview,
      evaluateExpiredDocuments: evaluateExpiredDocuments
    };
  }

  reports.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('reports', reports);
})();
