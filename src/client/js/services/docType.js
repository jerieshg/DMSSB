(function() {

  function documentTypes($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/document-types/')
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var find = function(id) {
      return $http.get(`/api/document-types/${id}`)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var _delete = function(id) {
      return $http.delete(`/api/document-types/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Tipo de documento borrado exitosamente!', 'danger');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(docType) {
      return $http.post('/api/document-types/', docType)
        .then((response) => {
          commonFactory.toastMessage(`Tipo de documento  ${docType.type} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Tipo de documento ${docType.type} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    var update = function(docType) {
      return $http.put(`/api/document-types/${docType._id}`, docType)
        .then((response) => {
          commonFactory.toastMessage('Tipo de documento ' + docType.type + ' fue actualizado exitosamente!', 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Tipo de documento ${docType.type} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    return {
      readAll: readAll,
      find: find,
      delete: _delete,
      save: save,
      update: update
    };
  }

  documentTypes.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('documentTypes', documentTypes);
})();
