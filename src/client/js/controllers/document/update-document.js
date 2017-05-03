function UpdateDocumentController($rootScope, $scope, $http, $stateParams, Upload, ObjectDiff, commonFactory, departments, documents) {

  initializeController();


  //TODO: IF IT'S THE SAME PERSON WHO APPROVES PREP FOR PRD, DO SOMETHING
  $scope.findApproval = function(e) {
    if (e) {
      $scope.selectedApproved = e;
    } else {
      $scope.selectedApproved = $scope.selectedDocument.approvals.filter((e) => {
        return e.user._id === $rootScope.client._id;
      });

      $scope.selectedApproved = $scope.selectedApproved ? $scope.selectedApproved[0] : {};
    }
  }

  $scope.saveApproved = function() {
    $scope.selectedApproved.created = new Date();
    $scope.selectedApproved.user = {
      _id: $rootScope.client._id,
      username: $rootScope.client.username
    };

    let added = false;

    $scope.selectedApproved.forBlueprint = $scope.selectedDocument.type.blueprint && !$scope.isQA && !$scope.isSGIA;
    $scope.selectedDocument.approvals.forEach(function(item, i) {
      if (item.user._id === $rootScope.client._id) {
        $scope.selectedDocument.approvals[i] = $scope.selectedApproved;
        added = true;
      }
    });

    if (!added) {
      $scope.selectedDocument.approvals.push(angular.copy($scope.selectedApproved));
    }

    if ($scope.isProcessOwner && !$scope.selectedDocument.flow.prepForPublication) {
      $scope.selectedDocument.flow.approvedByProcessOwner = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.status = "Preparado para publicacion";
        $scope.selectedDocument.flow.prepForPublication = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por dueño del proceso";
        $scope.selectedDocument.flow.prepForPublication = false;
        //SEND EMAIL TO DOC OWNER
      }

      //CHANGE THIS
    } else if ($scope.selectedDocument.type.blueprint && !$scope.isQA && !$scope.isSGIA) {
      //If everyone already approved the document
      if (checkBlueprintCompletedApprovals()) {
        //SI SE TIENE SGIA, MOVER A SGIA...ELSE MOVER A PREP FOR PRD
        $scope.selectedDocument.flow.blueprintApproved = true;
        if ($scope.selectedDocument.requiresSGIA) {
          $scope.selectedDocument.flow.revisionBySGIA = true;
          $scope.selectedDocument.status = "En revision por SGIA";
        } else {
          $scope.selectedDocument.flow.prepForPublication = true;
          $scope.selectedDocument.status = "Preparado para publicacion";
        }
      } else if (!$scope.selectedApproved.approved) {
        //ENVIAR CORREO QUE SE NEGO UNA APROBACION 
        $scope.selectedDocument.flow.blueprintApproved = false;
        $scope.selectedDocument.flow.prepForPublication = false;
        $scope.selectedDocument.flow.revisionBySGIA = false;
      }
    } else if ($scope.isQA) {
      //If it's approved and it is not in prep for Publication
      if ($scope.selectedApproved.approved && !$scope.selectedDocument.flow.prepForPublication) {
        $scope.selectedDocument.flow.approvedByQuality = $scope.selectedApproved.approved;
        if ($scope.selectedDocument.requiresSGIA) {
          $scope.selectedDocument.flow.revisionBySGIA = true;
          $scope.selectedDocument.status = "En revision por SGIA";
        } else {
          $scope.selectedDocument.flow.prepForPublication = true;
          $scope.selectedDocument.status = "Preparado para publicacion";
        }
        //If it's approved and it is almost ready to publish, then publish it
      } else if ($scope.selectedApproved.approved && $scope.selectedDocument.flow.prepForPublication) {
        $scope.selectedDocument.status = "Publicado";
        $scope.selectedDocument.flow.published = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por Calidad";

        if (!$scope.selectedDocument.flow.prepForPublication) {
          $scope.selectedDocument.flow.approvedByQuality = false;
        }
        //SEND EMAIL TO DOC OWNER
      }
    } else if ($scope.isSGIA) {
      $scope.selectedDocument.flow.approvedBySGIA = $scope.selectedApproved.approved;
      if ($scope.selectedApproved.approved) {
        $scope.selectedDocument.status = "Preparado para publicacion";
        $scope.selectedDocument.flow.prepForPublication = true;
      } else {
        $scope.selectedDocument.status = "Rechazado por SGIA";
        $scope.selectedDocument.flow.prepForPublication = false;
        //SEND EMAIL TO DOC OWNER
      }
    }

    /*
    if it's blueprint:
      Check autorized list if everyone said to approved, 
      if everyone approved the document, move to next status
      else if there's one false, then change status to "denied " or something like this
      else if there are missing approvals, remain in pending
    */

    /*
    If document is not a blue print and the calidad user is aprobing a document move to next status (check if SGIA on, if it's on, change status)
    */
    documents.updateApprovals($scope.selectedDocument)
      .then((data) => {
        console.log(data);
      });

    updateDocumentHistory();
    $scope.selectedApproved = {};
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

  function initializeController() {
    $(".datepicker input").datepicker({});
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

          //     Can approve only if client is a SGIA and already approved by Quality
          //     TODO: ADD CHECK IF EVERYONE HAS ALREADY AUTHORIZED THE DOCUMENT
          let sgia = $scope.selectedDocument.type.flow[$rootScope.client.business].approvals.sgia;
          $scope.isSGIA = (sgia) ? sgia.map(e => e._id).includes($rootScope.client._id) : false;

          let qa = $scope.selectedDocument.type.flow[$rootScope.client.business].approvals.qa;
          $scope.isQA = (qa) ? qa.map(e => e._id).includes($rootScope.client._id) : false;

          let deptBoss = $scope.selectedDocument.type.flow[$rootScope.client.business].approvals.deptBoss[$rootScope.client.department];
          $scope.isDepartmentBoss = (deptBoss) ? deptBoss.map((e) => e._id).includes($rootScope.client._id) : false;

          console.log($scope.isSGIA, $scope.isQA, $scope.isDepartmentBoss);

          //Check if already approved... by comparing to the documents approvals list

          if ($scope.isDepartmentBoss && !$scope.selectedDocument.flow.prepForPublication) {
            $scope.canApprove = true;
          }

          if ($scope.selectedDocument.requiresSGIA && $scope.isSGIA && $scope.selectedDocument.flow.approvedByQuality && !$scope.selectedDocument.flow.prepForPublication) {
            $scope.canApprove = true;
          }


          // departments.findByName($rootScope.client.department)
          //   .then((data) => {

          //     let documentRevision = (data && data.documentRevision);
          //     $scope.isQA = documentRevision;

          //     let isSGIA = (data && data.isSGIA);
          //     $scope.isSGIA = isSGIA;

          //     $scope.isProcessOwner = $scope.selectedDocument.type.hasProcessOwner && $scope.selectedDocument.department === dept && job.toUpperCase().includes('JEFE');

          //     //Can approve only if client is a SGIA and already approved by Quality
          //     //TODO: ADD CHECK IF EVERYONE HAS ALREADY AUTHORIZED THE DOCUMENT
          //     if (isSGIA && $scope.selectedDocument.flow.approvedByQuality && $scope.selectedDocument.requiresSGIA && !$scope.selectedDocument.flow.prepForPublication) {
          //       $scope.canApprove = true;
          //     }

          //     //IF USER IS DOCUMENT REVISION AND HAVE NOT APPROVED THE DOCUMENT then can approve
          //     if (documentRevision && (!$scope.selectedDocument.flow.approvedByQuality || $scope.selectedDocument.flow.prepForPublication)) {
          //       $scope.canApprove = true;
          //     }

          //     //IF ITS A BLUEPRINT and I HAVE NOT YET AUTHORISED THE DOCUMENT THEN AUTH
          //     if ($scope.selectedDocument.type.blueprint && !checkBlueprintCompletedApprovals()) {
          //       $scope.canApprove = true;
          //       // let foundAuth = $scope.selectedDocument.type.authorized.filter((auth) => {
          //       //   return auth.user._id === $rootScope.client._id
          //       // });

          //       // if (foundAuth && foundAuth.length > 0) {
          //       //   foundAuth = foundAuth[0];

          //       // }
          //     }

          //     //IF I AM A PROCESS OWNER THEN I CAN AUTHORISE THE DOCUMENT
          //     if ($scope.isProcessOwner && !$scope.selectedDocument.flow.prepForPublication) {
          //       $scope.canApprove = true;
          //     }
          //   });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  function checkBlueprintCompletedApprovals() {
    let approved = false;

    if ($scope.selectedDocument.type.blueprint) {
      let approvals = $scope.selectedDocument.approvals.filter((e) => e.forBlueprint);

      //If everyone already approved the document, check if someone denied it
      if (approvals.length === $scope.selectedDocument.type.authorized.length) {
        approved = approvals.every((approval) => {
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

UpdateDocumentController.$inject = ['$rootScope', '$scope', '$http', '$stateParams', 'Upload', 'ObjectDiff', 'commonFactory', 'departments', 'documents'];
angular.module('app', ['ngFileUpload', 'ds.objectDiff']).controller('updateDocumentController', UpdateDocumentController);
