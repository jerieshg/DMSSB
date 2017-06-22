(function() {

  function documentService($http, commonFactory) {

    var updateHistoricFiles = function(doc) {
      return $http.post('/api/documents/historic-files/', angular.toJson(doc))
        .then((response) => {
          commonFactory.toastMessage(`Documento ${doc.name} fue actualizado!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    }

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

    var save = function(doc) {
      return $http.post('/api/documents/', doc)
        .then((response) => {
          commonFactory.toastMessage(`Documento ${doc.name} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Documento ${doc.name} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }

          return error;
        });
    };

    var update = function(doc) {
      return $http.put(`/api/documents/${doc._id}/update/`, doc)
        .then((response) => {
          commonFactory.toastMessage(`Documento ${doc.name} fue actualizado exitosamente!`, 'success');
          return response;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Documento ${doc.name} ya existe.`, 'danger');
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

    var deleteHistoricFile = function(id, name) {
      return $http.delete(`/api/documents/${id}/historic-files/${name}`)
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
      update: update,
      updateApprovals: updateApprovals,
      deleteFile: deleteFile,
      updateHistoricFiles: updateHistoricFiles,
      deleteHistoricFile: deleteHistoricFile
    };
  }

  documentService.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('documents', documentService);
})();
