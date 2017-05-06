(function() {

  function documentService($http, commonFactory) {

    var _delete = function(id) {
      return $http.delete(`/api/documents/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Documento borrada exitosamente!', 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data}`, 'danger');
          return error;
        });
    };

    var save = function(business) {
      return $http.post('/api/documents/', business)
        .then((response) => {
          commonFactory.toastMessage(`Empresa ${business.business} ' fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`La empresa ${$scope.selectedBusiness.business} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }

          return error;
        });
    };


    var updateApprovals = function(doc) {
      return $http.put(`/api/documents/${doc._id}/approvals/`, doc)
        .then((response) => {
          // commonFactory.toastMessage(`Documento ${doc.name} ' fue actualizado exitosamente!`, 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var deleteFile = function(id, name) {
      return $http.delete(`/api/documents/${id}/file/${name}`)
        .then((response) => {
          commonFactory.toastMessage(`Archivo borrado exitosamente!`, 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    return {
      delete: _delete,
      save: save,
      updateApprovals: updateApprovals,
      deleteFile: deleteFile
    };
  }

  documentService.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('documents', documentService);
})();
