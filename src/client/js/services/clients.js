(function() {

  function clients($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/clients/')
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
      return $http.get(`/api/clients/${id}`)
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
      return $http.delete(`/api/clients/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Cliente/Usuario borrado exitosamente!', 'danger');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(client) {
      return $http.post('/api/clients/', client)
        .then((response) => {
          commonFactory.toastMessage(`Cliente/Usuario  ${client.username} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Cliente/Usuario ${client.username} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    var update = function(client) {
      return $http.put(`/api/clients/${client._id}`, client)
        .then((response) => {
          commonFactory.toastMessage('Cliente/Usuario ' + client.username + ' fue actualizado exitosamente!', 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Cliente/Usuario ${client.username} ya existe.`, 'danger');
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

  clients.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('clients', clients);
})();
