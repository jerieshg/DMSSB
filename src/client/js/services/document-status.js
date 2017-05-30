(function() {

  function documentStatus($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/documents-statuses/')
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
      return $http.get(`/api/documents-statuses/${id}`)
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
      return $http.delete(`/api/documents-statuses/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Estado de documento borrado exitosamente!', 'danger');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(documentStatus) {
      return $http.post('/api/documents-statuses/', documentStatus)
        .then((response) => {
          commonFactory.toastMessage(`Estado de documento  ${documentStatus.status} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Estado de documento ${documentStatus.status} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    var update = function(documentStatus) {
      return $http.put(`/api/documents-statuses/${documentStatus._id}`, documentStatus)
        .then((response) => {
          commonFactory.toastMessage('Estado de documento ' + documentStatus.status + ' fue actualizado exitosamente!', 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Departamento ${documentStatus.status} ya existe.`, 'danger');
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

  documentStatus.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('documentStatus', documentStatus);
})();
