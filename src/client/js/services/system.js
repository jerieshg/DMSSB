(function() {

  function system($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/systems/')
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
      return $http.get(`/api/systems/${id}`)
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
      return $http.delete(`/api/systems/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Sistema borrada exitosamente!', 'danger');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(system) {
      return $http.post('/api/systems/', system)
        .then((response) => {
          commonFactory.toastMessage(`Sistema  ${system.system} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Sistema ${system.system} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    var update = function(system) {
      return $http.put(`/api/systems/${system._id}`, system)
        .then((response) => {
          commonFactory.toastMessage('Sistema ' + system.system + ' fue actualizado exitosamente!', 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Sistema ${system.system} ya existe.`, 'danger');
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

  system.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('system', system);
})();
