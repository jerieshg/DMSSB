function UpdateDocumentController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory, departments, documents, email) {

  initializeController();

  $scope.addChangeControl = function() {
    $scope.documentChangeControl.docId = $scope.selectedDocument._id;

    $scope.changeControl.created = new Date();
    $scope.changeControl.user = {
      _id: $rootScope.client._id,
      username: $rootScope.client.username
    };

    $scope.documentChangeControl.changes.push(angular.copy($scope.changeControl));

    let url = `/api/documents-change-control/${(!$scope.documentChangeControl.new) ? $scope.documentChangeControl.docId : ''}`;
    let method = $scope.documentChangeControl.new ? 'POST' : 'PUT';

    $http({
        method: method,
        url: url,
        data: $scope.documentChangeControl
      }).then(function(response) {
        $scope.documentChangeControl = response.data;
        $scope.changeControl = {};
        commonFactory.toastMessage('Cambio guardado exitosamente!', 'success');
      })
      .catch(function(error) {
        commonFactory.toastMessage('Woops! Algo paso!', 'danger');
      });
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

  $scope.addToFiles = function(fileName) {
    $scope.selectedDocument.files.push({
      fileName: fileName,
      type: 'physical'
    });

    documents.update($scope.selectedDocument)
      .then((response) => {
        console.log(response);
      });

    $('#physicalFileModal').modal('toggle');
  }

  $scope.saveFiles = function() {
    if (commonFactory.dialog("Esta seguro? El documento volvera a un estado inicial en donde se reinicara el flujo de documentos.") && $scope.files && $scope.files.length) {
      resetFlow();

      let fileExtras = {};
      $scope.files.forEach((e) => {
        fileExtras[e.name] = {
          electronic: e.electronic
        }
      });

      Upload.upload({
        method: 'PUT',
        url: `/api/documents/${$scope.selectedDocument.name}/`,
        data: {
          files: $scope.files,
          document: angular.toJson($scope.selectedDocument),
          extras: angular.toJson(fileExtras)
        }
      }).then(function(response) {
        $scope.selectedDocument.files = response.data.files;
        updateDocumentHistory();
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

    if ($scope.forBlueprint) {

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
        })
    }

    documents.updateApprovals($scope.selectedDocument)
      .then((data) => {
        commonFactory.toastMessage(`Este documento fue ${$scope.selectedApproved.approved ? 'aprobado' : 'rechazado'}`, 'success');
        $scope.canApprove = !$scope.selectedApproved.approved;
        $scope.selectedApproved = {};
      });

    updateDocumentHistory();
    $('#approveDocumentModal').modal('toggle');
  }

  function updateDocumentHistory() {
    let changed = [];

    var diff = ObjectDiff.diffOwnProperties($scope.originalDocument, $scope.selectedDocument);
    //something has changed in the document
    if (diff.changed !== 'equal') {
      $scope.documentHistory.docId = $scope.selectedDocument._id;
      //Detect if it's a json value (FOR PUBLICATION OBJECT)
      for (let [key, value] of Object.entries(diff.value)) {

        if (value.changed === 'object change' && value.value.key) {
          value.added = value.value.key.added;
          value.removed = value.value.key.removed;
        }

        if (value.added && !isJson(value.added)) {
          changed.push(key);
          $scope.documentHistory.history.push({
            user: $rootScope.client.username,
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
          user: $rootScope.client.username,
          field: 'files',
          list: true,
          value: filesResult,
          created: new Date()
        });
      }

      let approvalsResult = $scope.selectedDocument.approvals.length - $scope.originalDocument.approvals.length;

      if (approvalsResult !== 0) {
        if (approvalsResult > 0) {
          for (let i = 0; i < approvalsResult; i++) {
            let missingElement = $scope.selectedDocument.approvals[$scope.selectedDocument.approvals.length - (i + 1)];

            $scope.documentHistory.history.push({
              user: $rootScope.client.username,
              field: 'approvals',
              value: missingElement.approved,
              customText: missingElement.comment,
              created: new Date()
            });
          }
        }
      }

      if ($scope.selectedDocument.type.type !== $scope.originalDocument.type.type) {
        $scope.documentHistory.history.push({
          user: $rootScope.client.username,
          field: 'type',
          added: $scope.selectedDocument.type.type,
          removed: $scope.originalDocument.type.type,
          created: new Date()
        });
      }

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

    return changed;
  }

  $scope.saveDocument = function() {
    if (commonFactory.dialog("Esta seguro de guardar el documento? El documento volvera a un estado inicial en donde se reinicara el flujo de documentos.")) {

      //updates document history
      let changed = updateDocumentHistory();

      if (changed.length > 0) {
        resetFlow();
      }

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

    if ($scope.selectedDocument.type.blueprint) {
      $scope.selectedDocument.status = "En revision por lista de autorizaciones";
    } else {
      let firstStep = $scope.selectedDocument.request[$scope.selectedDocument.business][0];

      if (firstStep.bossPriority && (firstStep.approvals[$rootScope.client.department] && firstStep.approvals[$rootScope.client.department].map(e => e._id).includes($rootScope.client._id))) {
        $scope.selectedDocument.request[$scope.selectedDocument.business][0].approved = true;

        let nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][1];
        if (!nextStep) {
          $scope.selectedDocument.publication.publicationDate = new Date();
          $scope.selectedDocument.status = "Publicado";
          $scope.selectedDocument.flow.published = true;
        } else {
          $scope.selectedDocument.status = `En revision por ${nextStep.name}`;
        }
      } else {
        $scope.selectedDocument.status = `En revision por ${firstStep.name}`;
      }
    }

    $scope.selectedDocument.request[$scope.selectedDocument.business].forEach((e, index) => {
      $scope.selectedDocument.request[$scope.selectedDocument.business][index].approved = false;
    });
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

  $scope.deleteFile = function(name) {
    if (commonFactory.dialog("Esta seguro de borrar este archivo?")) {
      documents.deleteFile($stateParams.id, name)
        .then((data) => {
          $scope.selectedDocument.files = data.files;
          updateDocumentHistory();
          commonFactory.toastMessage(`Archivo ${name} fue borrado!`, 'info');
        });
    }
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
      $scope.selectedDocument.publication.publicationDate = new Date();
      $scope.selectedDocument.status = "Publicado";
      $scope.selectedDocument.flow.published = true;
      if (!$scope.selectedDocument.request.dataUpdateOnly) {
        $scope.selectedDocument.publication.revision += 1;
      }

      $scope.selectedDocument.files.forEach((e, index) => {
        console.log($scope.selectedDocument.files[index]);
        $scope.selectedDocument.files[index].published = true;
      });

      $scope.publicationStep = false;
    }
  }

  function initializeController() {
    $scope.edit = false;
    $scope.priorities = ["Alta", "Normal", "Bajo"];
    $scope.isQA = false;
    $scope.isSGIA = false;
    $scope.canApprove = false;
    retrieveDocument();
    retrieveDocumentHistory();
    retrieveChangeControl();
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

        let nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][$scope.currentStep + 1];
        if (!$scope.selectedDocument.requiresSafetyEnv && nextStep && nextStep.forEnvironment) {
          nextStep = $scope.selectedDocument.request[$scope.selectedDocument.business][$scope.currentStep + 2];
        }

        if (!nextStep) {
          $scope.publicationStep = true;
        }

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

  function retrieveChangeControl() {
    $http.get(`/api/documents-change-control/${$stateParams.id}`)
      .then(function(response) {
        $scope.documentChangeControl = response.data;
        if (!$scope.documentChangeControl) {
          $scope.documentChangeControl = {
            new: true,
            changes: [],
            created: new Date()
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
}

UpdateDocumentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'Upload', 'ObjectDiff', 'commonFactory', 'departments', 'documents', 'email'];
angular.module('app', ['ngFileUpload', 'ds.objectDiff']).controller('updateDocumentController', UpdateDocumentController);
