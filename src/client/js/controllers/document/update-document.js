function UpdateDocumentController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory, departments, documents, email) {

  initializeController();

  $scope.selectFile = function(file, index) {
    $scope.selectedFile = {
      file: file,
      index: index
    };
  }

  $scope.uploadHistoricFiles = function() {
    Upload.upload({
      method: 'PUT',
      url: `/api/documents/historic-files/`,
      data: {
        document: angular.toJson($scope.selectedDocument),
        files: $scope.historicFiles
      }
    }).then(function(response) {
      $scope.selectedDocument.historicFiles = response.data.historicFiles;
      commonFactory.toastMessage('Guardado exitosamente!', 'success');
      updateDocumentHistory(false);
    }, function(response) {
      if (response.status > 0) {
        $scope.errorMsg = response.status + ': ' + response.data;
      }
    }, function(evt) {
      $scope.progress =
        Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  }

  $scope.moveToHistory = function() {
    if (commonFactory.dialog("Esta seguro que quiere pasar el archivo a historicos? No hay forma de regresarlo a su estado original.")) {
      let removed = $scope.selectedDocument.files.splice($scope.selectedFile.index, 1)[0];
      removed.history = true;
      $scope.selectedDocument.historicFiles.push(removed);

      documents.updateHistoricFiles($scope.selectedDocument)
        .then((response) => {
          console.log(response);
        });
    }
  }

  $scope.deleteHistoricFile = function(file) {
    if (commonFactory.dialog("Esta seguro de borrar este archivo?")) {
      documents.deleteHistoricFile($stateParams.id, file.fileName)
        .then((data) => {
          $scope.selectedDocument.historicFiles = data.historicFiles;
          updateDocumentHistory(false);
        });
    }
  }

  $scope.deleteFile = function() {
    if (commonFactory.dialog("Esta seguro de borrar este archivo?")) {
      documents.deleteFile($stateParams.id, $scope.selectedFile.file.fileName)
        .then((data) => {
          $scope.selectedDocument.files = data.files;
          updateDocumentHistory(false);
          $scope.selectedFile.fileName = null;
        });
    }
  }

  $scope.retrieveApproval = function(item, blueprint) {
    if (!blueprint) {
      return $scope.selectedDocument.approvals
        .filter((e) => !e.forBlueprint)
        .sort((a, b) => {
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        })
        .find((appr) => {
          return appr.user._id === item._id
        });
    } else {
      return $scope.selectedDocument.approvals
        .filter((e) => e.forBlueprint)
        .sort((a, b) => {
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        })
        .find((appr) => {
          return appr.user._id === item._id
        });
    }
  }

  $scope.saveFiles = function() {
    if (commonFactory.dialog(`Esta seguro de subir el archivo? ${$scope.shouldResetFlow ? 'El documento volvera a un estado inicial en donde se reinicara el flujo de documentos' : ''}.`) && $scope.files && $scope.files.length) {
      if ($scope.shouldResetFlow) {
        resetFlow();
      }

      let fileExtras = {};
      $scope.files.forEach((e) => {
        fileExtras[e.name] = {
          electronic: e.electronic,
          hd: e.hd
        }
      });

      Upload.upload({
        method: 'PUT',
        url: `/api/documents/`,
        data: {
          document: angular.toJson($scope.selectedDocument),
          extras: angular.toJson(fileExtras),
          files: $scope.files
        }
      }).then(function(response) {
        $scope.selectedDocument.files = response.data.files;
        commonFactory.toastMessage('Guardado exitosamente!', 'success');
        updateDocumentHistory(false);
      }, function(response) {
        if (response.status > 0) {
          $scope.errorMsg = response.status + ': ' + response.data;
        }
      }, function(evt) {
        $scope.progress =
          Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
    }
  }

  $scope.saveApproved = function() {
    $scope.selectedApproved.step = angular.copy($scope.currentStep);
    $scope.selectedApproved.created = new Date();
    $scope.selectedApproved.user = {
      _id: $rootScope.client._id,
      username: $rootScope.client.username
    };

    $scope.selectedDocument.approvals.push($scope.selectedApproved);

    $scope.selectedApproved.forBlueprint = $scope.forBlueprint;
    if ($scope.selectedDocument.flow.readyToPublish && $scope.publicationStep) {
      if ($scope.selectedApproved.approved) {
        publishDocument();
      } else {
        $scope.selectedDocument.status = `Rechazado para publicar`;
      }
    } else if ($scope.forBlueprint) {

      if (checkBlueprintCompletedApprovals()) {
        $scope.selectedDocument.flow.blueprintApproved = true;
        let nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][0];
        moveNextStep(nextStep);
      } else if (!$scope.selectedApproved.approved) {
        $scope.selectedDocument.flow.blueprintApproved = false;
      }
    } else {
      $scope.selectedDocument.request[$scope.selectedDocument.business][$scope.currentStep].approved = $scope.selectedApproved.approved;
      let nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][$scope.currentStep + 1];
      if (!$scope.selectedDocument.requiresSafetyEnv && nextStep && nextStep.forEnvironment) {
        nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][$scope.currentStep + 2];
      }

      if ($scope.selectedApproved.approved) {
        moveNextStep(nextStep);
      } else {
        $scope.selectedDocument.status = `Rechazado por ${$scope.selectedDocument.request[$scope.selectedDocument.business][$scope.currentStep].name}`;
      }
    }

    if (!$scope.selectedApproved.approved) {
      email.sendRejectedEmail($rootScope.client.username, $scope.selectedDocument._id)
        .then((response) => {
          console.log(response);
        });
    }

    documents.updateApprovals($scope.selectedDocument)
      .then((data) => {
        commonFactory.toastMessage(`Este documento fue ${$scope.selectedApproved.approved ? 'aprobado' : 'rechazado'}`, 'success');
        $scope.canApprove = !$scope.selectedApproved.approved;
        $scope.selectedApproved = {};
      });

    updateDocumentHistory(false);
    $('#approveDocumentModal').modal('toggle');
  }

  function updateDocumentHistory(shouldResetFlow) {
    let changed = [];

    var diff = ObjectDiff.diffOwnProperties($scope.originalDocument, $scope.selectedDocument);
    let user = {
      _id: $rootScope.client._id,
      username: $rootScope.client.username
    };
    //something has changed in the document
    if (diff.changed !== 'equal') {
      $scope.documentHistory.docId = $scope.selectedDocument._id;
      //Detect if it's a json value (FOR PUBLICATION OBJECT)
      for (let [key, value] of Object.entries(diff.value)) {
        if ((key === 'publication' || key === 'request') && (value.changed === 'object change' || value.changed === 'added')) {
          Object.keys(value.value).forEach(objectKey => {
            if (objectKey === 'key') {
              return;
            }

            let objValue = value.value[objectKey];
            if (objValue.changed && objValue.added && !isJson(objValue.added)) {
              changed.push(key);
              $scope.documentHistory.history.push({
                user: user,
                field: objectKey,
                added: objValue.added,
                removed: objValue.removed,
                created: new Date()
              });
            }
          });
        }

        if (value.changed === 'object change' && value.value.key) {
          value.added = value.value.key.added;
          value.removed = value.value.key.removed;
        } else if (value.changed === 'added') {
          value.added = value.value;
          value.removed = '';
        }

        if (value.added && !isJson(value.added)) {
          changed.push(key);
          $scope.documentHistory.history.push({
            user: user,
            field: key,
            added: value.added,
            removed: value.removed,
            created: new Date()
          });
        }
      }

      let filesResult = $scope.selectedDocument.files.length - $scope.originalDocument.files.length;

      if (filesResult !== 0) {
        $scope.documentHistory.history.push({
          user: user,
          field: 'files',
          list: true,
          value: filesResult,
          created: new Date()
        });
      }

      let historicFilesResult = $scope.selectedDocument.historicFiles.length - $scope.originalDocument.historicFiles.length;

      if (historicFilesResult !== 0) {
        $scope.documentHistory.history.push({
          user: user,
          field: 'historicFiles',
          list: true,
          value: historicFilesResult,
          created: new Date()
        });
      }

      let approvalsResult = $scope.selectedDocument.approvals.length - $scope.originalDocument.approvals.length;

      if (approvalsResult !== 0) {
        if (approvalsResult > 0) {
          for (let i = 0; i < approvalsResult; i++) {
            let missingElement = $scope.selectedDocument.approvals[$scope.selectedDocument.approvals.length - (i + 1)];

            $scope.documentHistory.history.push({
              user: user,
              field: 'approvals',
              value: missingElement.approved,
              customText: missingElement.comment,
              created: new Date()
            });
          }
        }
      }

      let changedType = $scope.selectedDocument.type.type !== $scope.originalDocument.type.type

      if (changedType) {
        changed.push('type');
        $scope.documentHistory.history.push({
          user: user,
          field: 'type',
          added: $scope.selectedDocument.type.type,
          removed: $scope.originalDocument.type.type,
          created: new Date()
        });
      }

      let originalRequestKey;
      if ($scope.originalDocument.request) {
        originalRequestKey = $scope.originalDocument.request.key;
      }
      
      let changedRequest = ($scope.selectedDocument.request.key !== originalRequestKey);
      if (changedRequest) {
        $scope.selectedDocument.createdBy = {
          _id: $rootScope.client._id,
          username: $rootScope.client.username
        };

        $scope.documentHistory.history.push({
          user: user,
          field: 'createdBy',
          added: $rootScope.client.username,
          removed: $scope.selectedDocument.createdBy ? $scope.selectedDocument.createdBy.username : '',
          created: new Date()
        });

        $scope.selectedDocument.requestedDate = new Date();
        $scope.documentHistory.history.push({
          user: user,
          field: 'requestedDate',
          added: $scope.selectedDocument.requestedDate,
          removed: $scope.originalDocument.requestedDate,
          created: new Date()
        });
      }

      if (shouldResetFlow && changed.length > 0) {
        resetFlow();
        updateDocumentHistory(false);
        return;
      }

      saveDocumentHistory();

      return changed;
    }

    function saveDocumentHistory() {
      let url = `/api/documents-history/${(!$scope.documentHistory.new) ? $scope.documentHistory.docId : ''}`;
      let method = $scope.documentHistory.new ? 'POST' : 'PUT';

      $http({
          method: method,
          url: url,
          data: $scope.documentHistory
        }).then(function(response) {
          $scope.documentHistory = response.data;
          $scope.originalDocument = angular.copy($scope.selectedDocument);
        })
        .catch(function(error) {
          console.log(error);
          commonFactory.toastMessage('Woops! Algo paso!', 'danger');
        });
    }
  }

  $scope.saveDocument = function() {
    if (commonFactory.dialog("Esta seguro de guardar el documento? El documento volvera a un estado inicial en donde se reinicara el flujo de documentos.")) {
      //updates document history
      let changed = updateDocumentHistory(true);

      documents.update($scope.selectedDocument)
        .then((response) => {
          console.log(response);
        });

      $scope.edit = false;
    }
  };

  $scope.resetFlow = function() {
    if (commonFactory.dialog("Esta seguro? El documento volvera a un estado inicial en donde se reinicara el flujo de documentos.")) {

      resetFlow();

      documents.update($scope.selectedDocument)
        .then((response) => {
          console.log(response);
        });
    }
  }

  function resetFlow() {
    $scope.selectedDocument.flow = {
      blueprintApproved: false,
      prepForPublication: false,
      published: $scope.selectedDocument.flow.published
    };

    $scope.selectedDocument.approvals = [];

    let request = $scope.selectedDocument.request ? $scope.selectedDocument.request[$scope.selectedDocument.business] : null;
    let firstStep = request ? request[0] : {};

    if ($scope.selectedDocument.type.blueprint) {
      $scope.selectedDocument.status = "En revision por lista de autorizaciones";
    } else {
      if (firstStep && firstStep.bossPriority && (firstStep.approvals[$rootScope.client.department] && firstStep.approvals[$rootScope.client.department].map(e => e._id).includes($rootScope.client._id))) {
        $scope.selectedDocument.request[$scope.selectedDocument.business][0].approved = true;

        let nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][1];
        if (!nextStep) {
          $scope.selectedDocument.status = "Listo para publicacion";
          $scope.selectedDocument.flow.readyToPublish = true;
        } else {
          $scope.selectedDocument.status = `En revision por ${nextStep.name}`;
          firstStep = nextStep;
        }
      } else {
        if (!firstStep || !firstStep.name) {
          $scope.selectedDocument.status = "Listo para publicacion";
          $scope.selectedDocument.flow.readyToPublish = true;
        } else {
          $scope.selectedDocument.status = `En revision por ${firstStep.name}`;
        }
      }
    }

    if (request) {
      $scope.selectedDocument.request[$scope.selectedDocument.business].forEach((e, index) => {
        $scope.selectedDocument.request[$scope.selectedDocument.business][index].approved = false;
      });
    }

    sendDocumentReminderEmail(firstStep);
  }

  $scope.download = function(fileName, filePath) {
    $http.get(`/api/documents/downloads/${encodeURIComponent(filePath)}`, {
        responseType: "arraybuffer"
      })
      .then(function(response) {
        var blob = new Blob([response.data], {
          type: 'application/octet-stream'
        });

        var objectUrl = URL.createObjectURL(blob);
        var anchor = document.createElement("a");
        anchor.download = fileName;
        anchor.href = objectUrl;
        anchor.click();
        anchor.remove();

        commonFactory.toastMessage(`Archivo descargado exitosamente!`, 'success');
      })
      .catch(function(error) {
        console.log(error);

        commonFactory.toastMessage(`Ha ocurrido un error. Por favor verifique que el archivo exista dentro del servidor. Puede que se haya subido dos veces con el mismo nombre y se borro uno de ellos`, 'success');
      });
  }

  $scope.retrieveImplications = function() {
    if ($scope.systems) {
      let filteredImplications = $scope.systems.filter(e => e.system === $scope.selectedDocument.system);

      return (filteredImplications.length > 0) ? filteredImplications[0].implications : [];
    }

    return null;
  }

  $scope.retrieveRequests = function() {
    if ($scope.selectedDocument) {
      let parsedArray = [];

      Object.keys($scope.selectedDocument.type.requests).forEach(function(key, index) {
        $scope.selectedDocument.type.requests[key].key = key;

        if ($scope.selectedDocument.type.requests[key].hideWhenPublished && $scope.selectedDocument.flow.published) {
          $scope.hidden = true;
          return;
        }


        parsedArray.push($scope.selectedDocument.type.requests[key]);
      });

      return parsedArray;
    }

    return null;
  }



  function checkBlueprintCompletedApprovals() {
    let approved = false;

    if ($scope.selectedDocument.type.blueprint) {
      let sortedApprovals = [];
      let unsortedApprovals =
        $scope.selectedDocument.approvals
        .filter((e) => e.forBlueprint)
        .reduce(function(rv, x) {
          (rv[x.user._id] = rv[x.user._id] || []).push(x);
          return rv;
        }, {});

      Object.keys(
        unsortedApprovals
      ).forEach((key) => {
        sortedApprovals.push(unsortedApprovals[key]
          .sort((a, b) => {
            return new Date(b.created).getTime() - new Date(a.created).getTime()
          })[0]);
      })

      //If everyone already approved the document, check if someone denied it
      if (sortedApprovals.length >= $scope.selectedDocument.implication.authorization[$scope.selectedDocument.business].length) {
        approved = sortedApprovals.every((approval) => {
          return approval.approved;
        });
      }
    }

    return approved;
  }

  function moveNextStep(nextStep) {
    if (nextStep) {
      $scope.selectedDocument.status = `En revision por ${nextStep.name}`;
    } else {
      $scope.selectedDocument.status = "Listo para publicacion";
      $scope.selectedDocument.flow.readyToPublish = true;
    }

    sendDocumentReminderEmail(nextStep);
  }

  function publishDocument() {
    $scope.selectedDocument.publication.publicationDate = new Date();
    $scope.selectedDocument.status = "Publicado";
    $scope.selectedDocument.flow.published = true;
    $scope.selectedDocument.flow.readyToPublish = false;
    if ($scope.selectedDocument.request && !$scope.selectedDocument.request.dataUpdateOnly) {
      $scope.selectedDocument.publication.revision += 1;
    }
    if ($scope.selectedDocument.periodExpirationTime) {
      let today = new Date();
      $scope.selectedDocument.expiredDate = new Date(
        today.setMonth(today.getMonth() + ($scope.selectedDocument.periodExpirationTime))
      );
    }

    $scope.selectedDocument.files.forEach((e, index) => {
      $scope.selectedDocument.files[index].published = true;
    });

    $scope.publicationStep = false;
  }

  function initializeController() {
    $scope.edit = false;
    $scope.priorities = ["Alta", "Normal", "Bajo"];
    $scope.isQA = false;
    $scope.isSGIA = false;
    $scope.canApprove = false;
    $scope.selectedFile = {};
    retrieveDocument();
    retrieveDocumentHistory();
    retrieveBusiness();
    retrieveClients();
    retrieveDepartments();
    retrieveDocTypes();
    retrieveSystems();

  }

  function retrieveDocument() {
    $http.get(`/api/documents/${$stateParams.id}/clients/${$rootScope.client._id}/verify`)
      .then(function(response) {
        $scope.selectedDocument = response.data.document;
        $scope.originalDocument = angular.copy($scope.selectedDocument);

        $scope.canApprove = response.data.approval.canApprove;
        $scope.currentStep = response.data.approval.step;
        $scope.forBlueprint = response.data.approval.blueprint;
        $scope.publicationStep = response.data.approval.publicationStep

        if (response.data.approval.blueprint) {
          let foundApproval = $scope.retrieveApproval({
            _id: $rootScope.client._id
          }, true);

          if (foundApproval && foundApproval.approved) {
            $scope.canApprove = false;
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      });
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

  function retrieveDocumentHistory() {
    $http.get(`/api/documents-history/${$stateParams.id}`)
      .then(function(response) {
        $scope.documentHistory = response.data;
        if (!$scope.documentHistory) {
          $scope.documentHistory = {
            new: true,
            history: []
          };
        }
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
    departments.readAll()
      .then(function(data) {
        $scope.departments = data;
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

  function isJson(item) {
    item = typeof item !== "string" ? JSON.stringify(item) : item;

    try {
      item = JSON.parse(item);
    } catch (e) {
      return false;
    }

    if (typeof item === "object" && item !== null) {
      return true;
    }

    return false;
  }

  function sendDocumentReminderEmail(step) {
    let users = [];

    if (!$scope.selectedDocument.flow.blueprintApproved) {
      if ($scope.selectedDocument.implication && $scope.selectedDocument.implication.authorization[$scope.selectedDocument.business]) {
        users = $scope.selectedDocument.implication.authorization[$scope.selectedDocument.business].map(e => e._id);
      }
    } else if (step) {
      if (step.requiresDept) {
        let approvals = step.approvals[$scope.selectedDocument.department];
        users = approvals ? approvals.map(e => (e._id)) : [];
      } else {
        users = step.approvals.map(e => (e._id));
      }
    }

    email.sendDocumentReminder($scope.selectedDocument._id, users)
      .then((response) => {
        console.log(response);
      });
  }
}

UpdateDocumentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'Upload', 'ObjectDiff', 'commonFactory', 'departments', 'documents', 'email'];
angular.module('app', ['ngFileUpload', 'ds.objectDiff']).controller('updateDocumentController', UpdateDocumentController);
