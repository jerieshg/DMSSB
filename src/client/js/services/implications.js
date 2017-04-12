(function() {

  function implications($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/implications/')
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
      return $http.get(`/api/implications/${id}`)
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
      return $http.delete(`/api/implications/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Implicacion borrada exitosamente!', 'danger');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(implication) {
      return $http.post('/api/implications/', implication)
        .then((response) => {
          commonFactory.toastMessage(`Implicacion  ${implication.implication} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Implicacion ${implication.implication} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    var update = function(implication) {
      return $http.put(`/api/implications/${implication._id}`, implication)
        .then((response) => {
          commonFactory.toastMessage('Implicacion ' + implication.implication + ' fue actualizado exitosamente!', 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Implicacion ${implication.implication} ya existe.`, 'danger');
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

  implications.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('implications', implications);
})();
