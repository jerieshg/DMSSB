(function() {

  function jobs($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/jobs/')
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
      return $http.get(`/api/jobs/${id}`)
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
      return $http.delete(`/api/jobs/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Posicion de trabajo borrada exitosamente!', 'danger');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(job) {
      return $http.post('/api/jobs/', job)
        .then((response) => {
          commonFactory.toastMessage(`Posicion de trabajo  ${job.job} fue guardado exitosamente!`, 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Posicion de trabajo ${job.job} ya existe.`, 'danger');
          } else {
            commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          }
          return error;
        });
    };

    var update = function(job) {
      return $http.put(`/api/jobs/${job._id}`, job)
        .then((response) => {
          commonFactory.toastMessage('Posicion de trabajo ' + job.job + ' fue actualizado exitosamente!', 'info');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          if (error.data.code === 11000) {
            commonFactory.toastMessage(`Posicion de trabajo ${job.job} ya existe.`, 'danger');
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

  jobs.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('jobs', jobs);
})();
