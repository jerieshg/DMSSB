(function() {

  function business($http, commonFactory) {

    var readAll = function() {
      return $http.get('/api/business/')
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
      return $http.get(`/api/business/${id}`)
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
      return $http.delete(`/api/business/${id}`)
        .then((response) => {
          commonFactory.toastMessage('Empresa borrada exitosamente!', 'success');
          return response.data;
        })
        .catch((error) => {
          console.log(error);
          commonFactory.toastMessage(`Oops! Algo erroneo paso: ${error.data.errmsg}`, 'danger');
          return error;
        });
    };

    var save = function(business) {
      return $http.post('/api/business/', business)
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

    var update = function(business) {
      return $http.put(`/api/business/${business._id}`, business)
        .then((response) => {
          commonFactory.toastMessage(`Empresa ${business.business} ' fue actualizado exitosamente!`, 'info');
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

    return {
      readAll: readAll,
      find: find,
      delete: _delete,
      save: save,
      update: update
    };
  }

  business.$inject = ['$http', 'commonFactory'];
  angular.module('app').service('business', business);
})();
