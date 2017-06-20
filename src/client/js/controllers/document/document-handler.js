function DocumentHandlerController($rootScope, $scope, $http, $state, Upload, commonFactory, uuid, email) {

  initializeController();

  function fillUsers(step) {
    let users = [];

    if (step.requiresDept) {
      let approvals = step.approvals[$scope.selectedDocument.department];
      users = approvals ? approvals.map(e => (e._id)) : [];
    } else {
      users = step.approvals.map(e => (e._id));
    }

    return users;
  }

  $scope.saveDocument = function() {
    if (($scope.selectedDocument.files && $scope.selectedDocument.files.length > 0) || ($scope.files && $scope.files.length > 0)) {

      let users = [];

      if ($scope.selectedDocument.type.blueprint) {
        $scope.selectedDocument.status = "En revision por lista de autorizaciones";
        if ($scope.selectedDocument.implication && $scope.selectedDocument.implication.authorization[$scope.selectedDocument.business]) {
          users = $scope.selectedDocument.implication.authorization[$scope.selectedDocument.business].map(e => e._id);
        }
      } else {
        let request = $scope.selectedDocument.request[$scope.selectedDocument.business];
        let firstStep = request ? request[0] : {};

        if (firstStep && firstStep.bossPriority && (firstStep.approvals[$rootScope.client.department] && firstStep.approvals[$rootScope.client.department].map(e => e._id).includes($rootScope.client._id))) {
          $scope.selectedDocument.request[$scope.selectedDocument.business][0].approved = true;

          let nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][1];
          if (!nextStep) {
            $scope.selectedDocument.status = "Listo para publicacion";
            $scope.selectedDocument.flow.readyToPublish = true;
          } else {
            users = fillUsers(nextStep);
            $scope.selectedDocument.status = `En revision por ${nextStep.name}`;
          }
        } else {
          if (!firstStep || !firstStep.name) {
            $scope.selectedDocument.status = "Listo para publicacion";
            $scope.selectedDocument.flow.readyToPublish = true;
          } else {
            users = fillUsers(firstStep);
            $scope.selectedDocument.status = `En revision por ${firstStep.name}`;
          }
        }
      }

      console.log(users);

      $scope.selectedDocument.requestedDate = new Date();

      delete $scope.selectedDocument.type["$$hashKey"];

      $scope.selectedDocument.createdBy = {
        _id: $rootScope.client._id,
        username: $rootScope.client.username
      };

      if (!$scope.selectedDocument.fileUUID) {
        $scope.selectedDocument.fileUUID = uuid.v1();
      }

      Upload.upload({
        url: `/api/documents/`,
        data: {
          document: angular.toJson($scope.selectedDocument),
          extras: angular.toJson($scope.fileExtras),
          files: $scope.files
        }
      }).then(function(response) {
        if (response.status === 200) {
          commonFactory.toastMessage('Documento creado exitosamente!', 'success');

          email.sendDocumentReminder(response.data._id, users)
            .then((response) => {
              console.log(response);
            });

          $state.go('app.docs.request');
        }
      }, function(response) {
        if (response.status > 0) {
          commonFactory.toastMessage('Algo paso! Por favor revise el documento o contacte al administrador', 'danger');
          $scope.selectedDocument.status = 'Nuevo';
        }
      }, function(evt) {
        $scope.progress =
          Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    } else {
      commonFactory.toastMessage("No se ha adjuntado un archivo!", "danger");
    }
  };

  $scope.saveFiles = function() {
    if ($scope.files && $scope.files.length) {

      $scope.fileExtras = {};
      $scope.files.forEach((e) => {
        $scope.fileExtras[e.name] = {
          electronic: e.electronic,
          hd: e.hd
        }
      });

      $('#filesModal').modal('toggle');
    }
  }

  $scope.retrieveImplications = function() {
    if ($scope.systems) {
      let filteredImplications = $scope.systems.filter(e => e.system === $scope.selectedDocument.system);
      return (filteredImplications.length > 0) ? filteredImplications[0].implications : [];
    }

    return null;
  }

  $scope.retrieveRequests = function() {
    if ($scope.selectedDocument.type) {
      let parsedArray = [];

      Object.keys($scope.selectedDocument.type.requests).forEach(function(key, index) {
        $scope.selectedDocument.type.requests[key].key = key;

        if ($scope.selectedDocument.type.requests[key].hideWhenPublished && $scope.selectedDocument.flow.published)
          return;

        parsedArray.push($scope.selectedDocument.type.requests[key]);
      });

      return parsedArray;
    }

    return null;
  }

  function initializeController() {
    $scope.selectedDocument = {
      status: "Nuevo",
      flow: {
        revisionBySGIA: false,
        approvedByBoss: false,
        approvedByQA: false,
        approvedBySGIA: false,
        approvedByManagement: false,
        blueprintApproved: false,
        prepForPublication: false,
        published: false,
        approvedByPrepForPublish: false
      },
      publication: {
        revision: 0
      },
      files: []
    };

    $scope.priorities = ["Alta", "Normal", "Bajo"];
    $scope.edit = true;
    retrieveBusiness();
    retrieveClients();
    retrieveDepartments();
    retrieveDocTypes();
    retrieveSystems();
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

  function retrieveDocTypes() {
    $http.get('/api/document-types/')
      .then(function(response) {
        $scope.docTypes = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function retrieveSystems() {
    $http.get('/api/systems/')
      .then(function(response) {
        $scope.systems = response.data;
      })
      .catch(function(error) {
        console.log(error);
      });
  }
}

DocumentHandlerController.$inject = ['$rootScope', '$scope', '$http', '$state', 'Upload', 'commonFactory', 'uuid', 'email'];
angular.module('app', ['ngFileUpload', 'angular-uuid']).controller('documentHandlerController', DocumentHandlerController);
