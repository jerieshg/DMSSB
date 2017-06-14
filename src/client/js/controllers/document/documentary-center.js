function DocumentaryCenterController($rootScope, $scope, $http, commonFactory, departments, documents, documentTypes, business) {

  initializeController();

  function initializeController() {
    $scope.expiredCheck = {};
    $scope.sortType = 'name'; // set the default sort type
    $scope.sortReverse = false; // set the default sort order
    $scope.searchCriteria = 'name';
    $scope.searchDoc = ''

    retrievePublishedDocuments();
    retrieveDepartments();
    retrieveBusiness();
    retrieveDocTypes();
  }

  $scope.deleteDocument = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar este documento?")) {
      documents.delete(id)
        .then((data) => {
          retrieveMyDocuments();
        });
    }
  }

  $scope.filesLocation = function(doc) {
    let result = '';

    let publishedFiles = doc.files.filter(e => e.published);
    // .map(e => e.electronic)
    let electronic = (publishedFiles.map(e => e.electronic).includes(true));
    let physical = (publishedFiles.map(e => e.hd).includes(true));

    if (physical && electronic) {
      return 'Electronico | En Duro';
    }

    result += (electronic) ? 'Electronico ' : '';
    result += (physical) ? ' En Duro' : '';

    return result;
  }

  $scope.doSearch = function() {
    if ($scope.search && !commonFactory.checkProperties($scope.search)) {
      $http.post('/api/documents/search/', $scope.search)
        .then((response) => {
          $scope.documents = response.data;
          $scope.documents.forEach((doc, index) => {
            calculateTimeMissing(doc.expiredDate, doc._id);
          });

          commonFactory.toastMessage(`Se han encontrado ${$scope.searchDocuments.length} documento(s)`, 'info');
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      commonFactory.toastMessage('No se ha escogido elementos de busqueda, por favor ingrese al menos uno.', 'danger');
      $scope.searchDocuments = [];
    }
  }

  $scope.downloadFiles = function(doc) {
    $http.get(`/api/documents/${doc._id}/downloads/`, {
        responseType: "arraybuffer"
      })
      .then(function(response) {
        var blob = new Blob([response.data], {
          type: 'application/octet-stream'
        });

        var objectUrl = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.download = `${doc.name}.zip`;
        anchor.href = objectUrl;
        anchor.click();
        anchor.remove();
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  $scope.filterBy = function() {
    if ($scope.searchDoc) {
      console.log($scope.searchCriteria);
      return function(doc) {
        let field = Object.byString(doc, $scope.searchCriteria);
        if (field) {
          return field.includes($scope.searchDoc);
        }
      }
    }

    return true;
  }

  Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, ''); // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
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

  function retrievePublishedDocuments() {
    $http.get(`/api/documents/`)
      .then(function(response) {
        $scope.documents = response.data;
        $scope.documents.forEach((doc, index) => {
          calculateTimeMissing(doc.expiredDate, doc._id);
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveDepartments() {
    departments.readAll()
      .then((data) => {
        $scope.departments = data;
      });
  }

  function retrieveBusiness() {
    business.readAll()
      .then((data) => {
        $scope.business = data;
      })
  }

  function retrieveDocTypes() {
    documentTypes.readAll()
      .then((data) => {
        $scope.docTypes = data;
      });
  }
}

DocumentaryCenterController.$inject = ['$rootScope', '$scope', '$http', 'commonFactory', 'departments', 'documents', 'documentTypes', 'business'];
angular.module('app').controller('documentaryCenterController', DocumentaryCenterController);
