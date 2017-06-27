function ReportsController($rootScope, $scope, $http, commonFactory, reports, documentStatus) {

  initializeController();

  function initializeController() {
    retrieveDocTypes();
    retrieveDocumentStatus();

    $scope.selectedCriteria = {};
    $scope.selectedReport = {};
    $scope.reports = [{
      name: 'Revision de estado de aprobaciones',
      method: 'evaluateRequestStepReport'
    }, {
      name: 'Evaluacion de documentos listos para publicar',
      method: 'documentaryCenterReport'
    }];
    $scope.reports.sort((a, b) => a.name > b.name);
  }



  $scope.executeReport = function() {
    reports[$scope.selectedReport.method]($scope.selectedCriteria)
      .then((response) => {
        console.log(response);
        $scope.report = response.data;
        let correct = 0;
        $scope.report.forEach((e) => {
          if ($scope.selectedCriteria.graceDays - e.daysDifference >= 0) {
            correct++;
          }
        });
        $scope.grade = (correct / $scope.report.length) * 100;
      });
  }

  $scope.retrieveRequests = function() {
    if ($scope.selectedCriteria.type) {
      let parsedArray = [];

      Object.keys($scope.selectedCriteria.type.requests).forEach(function(key, index) {
        $scope.selectedCriteria.type.requests[key].key = key;
        parsedArray.push($scope.selectedCriteria.type.requests[key]);
      });

      return parsedArray;
    }

    return null;
  }

  function retrieveDocTypes() {
    $http.get('/api/document-types/')
      .then(function(response) {
        $scope.docTypes = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDocumentStatus() {
    documentStatus.readAll()
      .then((data) => {
        $scope.documentStatuses = data;
        $scope.documentStatuses.push({
          status: "Lista de autorizaciones"
        });
      })
  }
}

ReportsController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'reports', 'documentStatus'];
angular.module('app').controller('reportsController', ReportsController);
