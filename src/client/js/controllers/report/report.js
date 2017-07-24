function ReportsController($rootScope, $scope, $http, commonFactory, reports, documentStatus) {

  initializeController();

  function initializeController() {
    retrieveDocTypes();
    retrieveDocumentStatus();

    $scope.expiredCheck = {};
    $scope.selectedCriteria = {};
    $scope.selectedReport = {};
    $scope.reports = [{
      name: 'Revision de estado de aprobaciones',
      method: 'evaluateRequestStepReport'
    }, {
      name: 'Evaluacion de documentos listos para publicar',
      method: 'documentaryCenterReport'
    }, {
      name: 'Evaluacion de documentos rechazados',
      method: 'evaluateRejectedDocuments',
      department: true
    }, {
      name: 'Evaluacion de documentos en revision',
      method: 'evaluateDocumentsUnderReview',
      department: true
    }, {
      name: 'Evaluacion de documentos por expirar',
      method: 'evaluateExpiredDocuments',
      department: true,
      showExpired: true
    }];

    $scope.reports.sort((a, b) => a.name > b.name);
  }

  $scope.resetReport = function() {
    $scope.report = {};
  }

  $scope.executeReport = function() {
    reports[$scope.selectedReport.method]($scope.selectedCriteria)
      .then((response) => {
        console.log(response);
        $scope.report = response.data;

        if ($scope.report.departmentFiltered) {
          Object.keys($scope.report.departmentFiltered).forEach((key, index) => {
            $scope.report.departmentFiltered[key].response.forEach((value) => {
              calculateTimeMissing(value.document.expiredDate, value.document._id);
            });
          });
        }
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

  function calculateTimeMissing(date, index) {
    $scope.expiredCheck[index] = {};

    if (!date) {
      $scope.expiredCheck[index].suffix = '';
      $scope.expiredCheck[index].time = 'Indefinido';
      return;
    }

    let expiredDate = new Date(date);
    let today = new Date();

    var utc1 = Date.UTC(expiredDate.getFullYear(), expiredDate.getMonth(), expiredDate.getDate());
    var utc2 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

    let difference = Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
    $scope.expiredCheck[index].suffix = ' days';
    $scope.expiredCheck[index].time = difference;
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
        // $scope.documentStatuses.push({
        //   status: "Lista de autorizaciones"
        // });
      })
  }
}

ReportsController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'reports', 'documentStatus'];
angular.module('app').controller('reportsController', ReportsController);
