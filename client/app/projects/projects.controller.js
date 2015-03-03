'use strict';

angular.module('observatory3App')
  .controller('ProjectsCtrl', function ($scope, $http) {
    $scope.projects = [];

    $http.get('/api/projects').success(function(projects) {
      $scope.projects = projects;
    });
  });
