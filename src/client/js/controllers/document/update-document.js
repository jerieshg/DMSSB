function UpdateDocumentController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory, departments, documents) {

  initializeController();

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
        console.log(response);
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


    $scope.selectedApproved.forBlueprint = $scope.selectedDocument.type.blueprint && !$scope.isManagement;
    $scope.selectedDocument.approvals.push(angular.copy($scope.selectedApproved));

    //If the document is a blueprint and I am not from management, then I am authorizing the document
    if (($scope.isManagement && !$scope.selectedDocument.type.blueprint) || ($scope.selectedDocument.type.blueprint && $scope.selectedDocument.flow.blueprintApproved && $scope.isManagement)) {
      console.log("GERENCIA");
      $scope.selectedDocument.flow.approvedByManagement = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.flow.prepForPublication = true;
        $scope.selectedDocument.status = "Preparado para publicacion";
      } else {
        $scope.selectedDocument.status = "Rechazado por la gerencia";
        //SEND EMAIL TO DOC OWNER
      }
    } else if ($scope.isSGIA && $scope.selectedDocument.type.requiresSGIA && $scope.selectedDocument.flow.approvedByQA) {
      console.log("SGIA");
      $scope.selectedDocument.flow.approvedBySGIA = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.status = "Preparado para publicacion";
        $scope.selectedDocument.flow.prepForPublication = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por SGIA";
        //SEND EMAIL TO DOC OWNER
      }
    } else if ($scope.isDeptBoss && !$scope.selectedDocument.flow.approvedByQA && !$scope.selectedDocument.flow.approvedByManagement) {
      console.log("JEFE");
      $scope.selectedDocument.flow.approvedByBoss = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        if ($scope.selectedDocument.type.isProcessOrManual) {
          $scope.selectedDocument.status = "En revision por gerencia";
        } else {
          $scope.selectedDocument.status = "En revision por calidad";
        }
      } else {
        $scope.selectedDocument.status = "Rechazado por jefe de departamento";
        //SEND EMAIL TO DOC OWNER
      }
    } else if ($scope.selectedDocument.type.blueprint && !$scope.isManagement) {
      console.log("LISTA DE AUTH");
      $scope.selectedApproved.forBlueprint = true;
      //If everyone already approved the document
      if (checkBlueprintCompletedApprovals()) {
        //SI SE TIENE SGIA, MOVER A SGIA...ELSE MOVER A PREP FOR PRD
        $scope.selectedDocument.flow.blueprintApproved = true;
        $scope.selectedDocument.status = "En revision por gerencia";
      } else if (!$scope.selectedApproved.approved) {
        //ENVIAR CORREO QUE SE NEGO UNA APROBACION 
        $scope.selectedDocument.flow.blueprintApproved = false;
      }
      //If it's a dept Boss and document has not already been approved by QA and Management, then I will be able to approve it
    } else if ($scope.isQA) {
      console.log("QA");
      //If it's approved and it is not in prep for Publication
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
        //SEND EMAIL TO DOC OWNER
      }
    } else if ($scope.isPrepForPublication && $scope.selectedDocument.flow.prepForPublication) {
      console.log("Preparacion para publicacion");
      $scope.selectedDocument.flow.approvedByPrepForPublish = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.status = "Publicado";
        $scope.selectedDocument.flow.published = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por encargado de publicar el documento";
      }
    }

    documents.updateApprovals($scope.selectedDocument)
      .then((data) => {
        console.log(data);
      });

    updateDocumentHistory();
    $('#approveDocumentModal').modal('toggle');
    $scope.canApprove = !$scope.selectedApproved.approved;
  }

  function updateDocumentHistory() {
    var diff = ObjectDiff.diffOwnProperties($scope.originalDocument, $scope.selectedDocument);
    //something has changed in the document
    if (diff.changed !== 'equal') {
      $scope.documentHistory.docId = $scope.selectedDocument._id;
      for (let [key, value] of Object.entries(diff.value)) {
        if (value.added) {
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
  }

  $scope.saveDocument = function() {
    //updates document history
    updateDocumentHistory();
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

    //sends email

    //   if ($scope.files && $scope.files.length) {


    //     delete $scope.selectedDocument.type["$$hashKey"];

    //     Upload.upload({
    //       url: `/api/documents/${$scope.selectedDocument.name}`,
    //       data: {
    //         files: $scope.files,
    //         document: $scope.selectedDocument
    //       }
    //     }).then(function(response) {
    //       console.log(response);
    //     }, function(response) {
    //       if (response.status > 0) {
    //         $scope.errorMsg = response.status + ': ' + response.data;
    //       }
    //     }, function(evt) {
    //       $scope.progress =
    //         Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    //     });
    //   }
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
    if (confirm("Esta seguro de borrar este archivo?")) {
      documents.deleteFile($stateParams.id, name)
        .then((data) => {
          $scope.selectedDocument.files = data.files;
          updateDocumentHistory();
        });
    }
  }

  function initializeController() {
    $(".datepicker input").datepicker({});
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
        $scope.selectedDocument.requestedDate = commonFactory.formatDate(new Date($scope.selectedDocument.requestedDate));
        $scope.selectedDocument.requiredDate = commonFactory.formatDate(new Date($scope.selectedDocument.requiredDate));
        $scope.selectedDocument.expiredDate = commonFactory.formatDate(new Date($scope.selectedDocument.expiredDate));
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

          if (!foundApproval || !foundApproval.approved) {
            if ($scope.selectedDocument.type.blueprint && !$scope.selectedDocument.flow.blueprintApproved) {
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

                if ($scope.isDeptBoss && !$scope.selectedDocument.flow.approvedByBoss) {
                  $scope.canApprove = true;
                } else if ($scope.isManagement && !$scope.selectedDocument.flow.approvedByManagement) {
                  $scope.canApprove = true;
                } else if ($scope.isQA && !$scope.selectedDocument.flow.approvedByQA && (!$scope.selectedDocument.flow.prepForPublication || $scope.selectedDocument.flow.approvedByBoss)) {
                  $scope.canApprove = true;
                } else if ($scope.isSGIA && $scope.selectedDocument.type.requiresSGIA && !$scope.selectedDocument.flow.approvedBySGIA && $scope.selectedDocument.flow.approvedByQA) {
                  $scope.canApprove = true;
                } else if ($scope.isPrepForPublication && $scope.selectedDocument.flow.prepForPublication) {
                  $scope.canApprove = true;
                }
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

UpdateDocumentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'Upload', 'ObjectDiff', 'commonFactory', 'departments', 'documents'];
angular.module('app', ['ngFileUpload', 'ds.objectDiff']).controller('updateDocumentController', UpdateDocumentController);
