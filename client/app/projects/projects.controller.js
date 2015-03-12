'use strict';

angular.module('observatory3App')
  .controller('ProjectsCtrl', function ($scope, $http) {
    $scope.projects = [];

    $http.get('/api/projects').success(function(projects) {
      $scope.projects = projects;
    });
  });

angular.module('observatory3App')
  .controller('addCtrl', function ($scope, $http) {
    $scope.project = {};

    $scope.submit = function() {
        $('#addProject').modal('hide');
        // use setTimeout because hiding the modal takes longer than the post request
        // and results in the modal disappearing but the overlay staying if not used
        setTimeout(function() {
            $http.post('/api/projects', $scope.project);
            $scope.project = {};
        }, 200);
    }
});
