function UpdateDocumentController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory, departments, documents, email) {

  initializeController();

  $scope.convertApproval = function(key) {
    switch (key) {
      case 'deptBoss':
        return `Jefe de departamento - ${$scope.selectedDocument.flow.approvedByBoss ? 'Aprobado' : 'No Aprobado'}`;
      case 'sgia':
        return `Seguridad - ${$scope.selectedDocument.flow.approvedBySGIA ? 'Aprobado' : 'No Aprobado'}`;
      case 'sgma':
        return `Seguridad de Medioambiente - ${$scope.selectedDocument.flow.approvedBySGMA ? 'Aprobado' : 'No Aprobado'}`;
      case 'qa':
        return `Calidad - ${$scope.selectedDocument.flow.approvedByQA ? 'Aprobado' : 'No Aprobado'}`;
      case 'management':
        return `Gerencia - ${$scope.selectedDocument.flow.approvedByManagement ? 'Aprobado' : 'No Aprobado'}`;
      case 'prepForPublication':
        return `Preparacion para publicacion - ${$scope.selectedDocument.flow.approvedByPrepForPublish ? 'Aprobado' : 'No Aprobado'}`;
      default:
        return null;
    }
  }

  $scope.triggerEdit = function() {
    $scope.edit = !$scope.edit;
  }

  $scope.uploadFiles = function() {
    if ($scope.files && $scope.files.length) {
      Upload.upload({
        method: 'PUT',
        url: `/api/documents/${$scope.selectedDocument.name}/`,
        data: {
          files: $scope.files,
          document: $scope.selectedDocument
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
    $scope.selectedApproved.created = new Date();
    $scope.selectedApproved.user = {
      _id: $rootScope.client._id,
      username: $rootScope.client.username
    };

    let rejected = false;

    $scope.selectedDocument.approvals.push($scope.selectedApproved);

    $scope.selectedApproved.forBlueprint = $scope.selectedDocument.type.blueprint && !$scope.isManagement;
    //If the document is a blueprint and I am not from management, then I am authorizing the document
    if (!$scope.selectedDocument.flow.approvedByManagement && ($scope.isManagement && !$scope.selectedDocument.type.blueprint) || ($scope.selectedDocument.type.blueprint && $scope.selectedDocument.flow.blueprintApproved && $scope.isManagement)) {
      console.log("GERENCIA");
      $scope.selectedDocument.flow.approvedByManagement = $scope.selectedApproved.approved;
      $scope.selectedApproved.step = "Management";
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.flow.prepForPublication = true;
        $scope.selectedDocument.status = "Preparado para publicacion";
      } else {
        $scope.selectedDocument.status = "Rechazado por la gerencia";
        rejected = true;
      }
    } else if ($scope.isSGIA && $scope.selectedDocument.type.requiresSGIA && !$scope.selectedDocument.flow.approvedBySGIA && $scope.selectedDocument.flow.approvedByQA) {
      console.log("SGIA");
      $scope.selectedDocument.flow.approvedBySGIA = $scope.selectedApproved.approved;
      $scope.selectedApproved.step = "SGIA";
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.status = "Preparado para publicacion";
        $scope.selectedDocument.flow.prepForPublication = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por SGIA";
        rejected = true;
      }
    } else if ($scope.isDeptBoss && !$scope.selectedDocument.flow.approvedByBoss && !$scope.selectedDocument.flow.approvedByQA && !$scope.selectedDocument.flow.approvedByManagement) {
      console.log("JEFE");
      $scope.selectedDocument.flow.approvedByBoss = $scope.selectedApproved.approved;
      $scope.selectedApproved.step = "boss";
      if ($scope.selectedApproved.approved) {
        if ($scope.selectedDocument.type.isProcessOrManual) {
          $scope.selectedDocument.status = "En revision por gerencia";
        } else {
          $scope.selectedDocument.flow.approvedByQA = true; //Check this
          $scope.selectedDocument.flow.prepForPublication = true;
          $scope.selectedDocument.status = "Preparado para publicacion";
        }
      } else {
        $scope.selectedDocument.status = "Rechazado por jefe de departamento";
        rejected = true;
      }
    } else if (!$scope.selectedDocument.flow.blueprintApproved && $scope.selectedDocument.type.blueprint && !$scope.isManagement) {
      console.log("LISTA DE AUTH");
      $scope.selectedApproved.step = "authList";
      $scope.selectedApproved.forBlueprint = true;
      //If everyone already approved the document
      if (checkBlueprintCompletedApprovals()) {
        //SI SE TIENE SGIA, MOVER A SGIA...ELSE MOVER A PREP FOR PRD
        $scope.selectedDocument.flow.blueprintApproved = true;
        $scope.selectedDocument.status = "En revision por gerencia";
      } else if (!$scope.selectedApproved.approved) {
        //ENVIAR CORREO QUE SE NEGO UNA APROBACION 
        $scope.selectedDocument.flow.blueprintApproved = false;
        rejected = true;
      }
    } else if ($scope.isQA && !$scope.selectedDocument.flow.approvedByQA) {
      console.log("QA");
      $scope.selectedApproved.step = "QA";
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.flow.approvedByQA = $scope.selectedApproved.approved;
        if ($scope.selectedDocument.type.requiresSGIA) {
          $scope.selectedDocument.flow.revisionBySGIA = true;
          $scope.selectedDocument.status = "En revision por SGIA";
        } else {
          $scope.selectedDocument.flow.prepForPublication = true;
          $scope.selectedDocument.status = "Preparado para publicacion";
        }
      } else {
        $scope.selectedDocument.status = "Rechazado por Calidad";
        rejected = true;
      }
    } else if ($scope.isPrepForPublication && $scope.selectedDocument.flow.prepForPublication && !$scope.selectedDocument.flow.approvedByPrepForPublish) {
      console.log("Preparacion para publicacion");
      $scope.selectedApproved.step = "p2p";
      $scope.selectedDocument.flow.approvedByPrepForPublish = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.status = "Publicado";
        $scope.selectedDocument.flow.published = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por encargado de publicar el documento";
        rejected = true;
      }
    }

    if (rejected) {
      email.sendRejectedEmail($rootScope.client.username, $scope.selectedDocument._id)
        .then((response) => {
          console.log(response);
        })
    }



    documents.updateApprovals($scope.selectedDocument)
      .then((data) => {
        console.log(data);
        commonFactory.toastMessage(`Este documento fue ${$scope.selectedApproved.approved ? 'aprobado' : 'rechazado'}`, 'success');
      });

    updateDocumentHistory();
    $('#approveDocumentModal').modal('toggle');
    $scope.canApprove = !$scope.selectedApproved.approved;
    $scope.selectedApproved = {};
  }

  function updateDocumentHistory() {
    let changed = [];

    var diff = ObjectDiff.diffOwnProperties($scope.originalDocument, $scope.selectedDocument);
    //something has changed in the document
    if (diff.changed !== 'equal') {
      $scope.documentHistory.docId = $scope.selectedDocument._id;
      for (let [key, value] of Object.entries(diff.value)) {
        if (value.added) {
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

      let versionOrCommentOnly = changed.every((value) => {
        return value === 'version' || value === 'comment';
      })

      if (!versionOrCommentOnly) {
        //updates document
        $scope.selectedDocument.flow = {
          revisionBySGIA: false,
          approvedByBoss: false,
          approvedByQA: false,
          approvedBySGIA: false,
          approvedByManagement: false,
          approvedByPrepForPublish: false,
          blueprintApproved: false,
          prepForPublication: false,
          published: false
        };

        $scope.selectedDocument.approvals = [];

        if ($scope.selectedDocument.type.blueprint) {
          $scope.selectedDocument.status = "En revision por lista de autorizaciones";
        } else {
          if ($rootScope.client.department.toUpperCase().includes('JEFE') && !$scope.selectedDocument.type.isProcessOrManual) {
            $scope.selectedDocument.status = "En revision por Calidad";
            $scope.selectedDocument.approvedByBoss = true;
          } else {
            $scope.selectedDocument.status = "En revision por jefe de departamento";
          }
        }
      }

      documents.update($scope.selectedDocument)
        .then((response) => {
          console.log(response);

        });

      $scope.edit = false;
    }
  };

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

  $scope.deleteFile = function(name) {
    if (commonFacotry.dialog("Esta seguro de borrar este archivo?")) {
      documents.deleteFile($stateParams.id, name)
        .then((data) => {
          $scope.selectedDocument.files = data.files;
          updateDocumentHistory();
          commonFactory.toastMessage(`Archivo ${name} fue borrado!`, 'info');
        });
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
    retrieveBusiness();
    retrieveClients();
    retrieveDepartments();
    retrieveDocTypes();
    retrieveSystems();

  }

  function retrieveDocument() {
    $http.get(`/api/documents/${$stateParams.id}`)
      .then(function(response) {
        $scope.selectedDocument = response.data;
        $scope.originalDocument = angular.copy($scope.selectedDocument);
        if (!$scope.selectedDocument.flow.published) {

          let approvals = $scope.selectedDocument.approvals;

          approvals.sort(function(a, b) {
            return new Date(b.created).getTime() - new Date(a.created).getTime()
          });

          //If I already have answered, I cannot change my mind...
          let foundApproval = approvals.find((e) => {
            return e.user._id === $rootScope.client._id
          });

          if ($scope.selectedDocument.type.blueprint && !$scope.selectedDocument.flow.blueprintApproved && !(foundApproval && foundApproval.step === "authList" && foundApproval.approved)) {
            $scope.canApprove = $scope.selectedDocument.implication.authorization.map(a => a._id).includes($rootScope.client._id);
          } else {
            let business = $rootScope.client.business[$rootScope.client.business.indexOf($scope.selectedDocument.business)];

            let selectedFlow = $scope.selectedDocument.type.flow[(business) ? business : $rootScope.client.business];

            if (selectedFlow) {
              let sgia = selectedFlow.approvals.sgia;
              $scope.isSGIA = (sgia) ? sgia.map(e => e._id).includes($rootScope.client._id.toString()) : false;

              let qa = selectedFlow.approvals.qa;
              $scope.isQA = (qa) ? qa.map(e => e._id).includes($rootScope.client._id.toString()) : false;

              let deptBoss = (selectedFlow.approvals.deptBoss) ? selectedFlow.approvals.deptBoss[$rootScope.client.department] : false;
              $scope.isDeptBoss = (deptBoss) ? deptBoss.map((e) => e._id).includes($rootScope.client._id.toString()) : false;

              let management = selectedFlow.approvals.management;
              $scope.isManagement = (management) ? management.map(e => e._id).includes($rootScope.client._id.toString()) : false;

              let prepForPublication = selectedFlow.approvals.prepForPublication;
              $scope.isPrepForPublication = (prepForPublication) ? prepForPublication.map(e => e._id).includes($rootScope.client._id.toString()) : false;

              if ($scope.isDeptBoss && !$scope.selectedDocument.flow.approvedByBoss && !(foundApproval && foundApproval.step === "boss" && foundApproval.approved)) {
                $scope.canApprove = true;
              } else if ($scope.isManagement && !$scope.selectedDocument.flow.approvedByManagement && !(foundApproval && foundApproval.step === "management" && foundApproval.approved)) {
                $scope.canApprove = true;
              } else if ($scope.isQA && !$scope.selectedDocument.flow.approvedByQA && !(foundApproval && foundApproval.step === "QA" && foundApproval.approved)) {
                $scope.canApprove = true;
              } else if ($scope.isSGIA && $scope.selectedDocument.type.requiresSGIA && !$scope.selectedDocument.flow.approvedBySGIA && $scope.selectedDocument.flow.approvedByQA && !(foundApproval && foundApproval.step === "SGIA" && foundApproval.approved)) {
                $scope.canApprove = true;
              } else if ($scope.isPrepForPublication && $scope.selectedDocument.flow.prepForPublication && !$scope.selectedDocument.flow.approvedByPrepForPublish && !(foundApproval && foundApproval.step === "p2p" && foundApproval.approved)) {
                $scope.canApprove = true;
              }
            }
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      });
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
      if (sortedApprovals.length >= $scope.selectedDocument.implication.authorization.length) {
        approved = sortedApprovals.every((approval) => {
          return approval.approved;
        });
      }
    }

    console.log(approved);

    return approved;
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
}

UpdateDocumentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'Upload', 'ObjectDiff', 'commonFactory', 'departments', 'documents', 'email'];
angular.module('app', ['ngFileUpload', 'ds.objectDiff']).controller('updateDocumentController', UpdateDocumentController);
