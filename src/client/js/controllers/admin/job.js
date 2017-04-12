function JobController($scope, $http, commonFactory, jobs) {

  initializeController();

  $scope.selectedJob = {};

  $scope.print = function() {
    commonFactory.printTable("adminTable");
  }

  $scope.newJob = function() {
    $scope.selectedJob = {};
  }

  $scope.saveJob = function() {
    if ($scope.selectedJob.edit) {
      jobs.update($scope.selectedJob)
        .then((data) => {
          $scope.selectedJob = {};
          retrieveJobs();
        });
    } else {
      $scope.selectedJob.created = new Date();
      jobs.save($scope.selectedJob)
        .then((data) => {
          $scope.selectedJob = {};
          retrieveJobs();
        });
    }
  }

  $scope.updateJob = function(id) {
    jobs.find(id)
      .then((data) => {
        $scope.selectedJob = data;
        $scope.selectedJob.edit = true;
      });
  }

  $scope.deleteJob = function(id) {
    if (commonFactory.dialog("Esta seguro de borrar esta posicion de trabajo?")) {
      jobs.delete(id)
        .then((data) => {
          retrieveJobs();
          $scope.selectedJob = {};
        });
    }
  }

  function initializeController() {
    retrieveJobs();
  }

  function retrieveJobs() {
    jobs.readAll()
      .then((data) => {
        $scope.jobs = data;
      });
  }
}

JobController.$inject = ['$scope', '$http', 'commonFactory', 'jobs'];
angular.module('app').controller('jobsController', JobController);
