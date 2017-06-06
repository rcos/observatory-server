'use strict';

angular.module('observatory3App')
  .controller('MainController', function ($scope, $http, User) {
    $scope.projectStats = {};
    $scope.userStats = User.stats();

    $http.get('/api/projects/stats').success(function(stats) {
      $scope.projectStats = stats;
    });

    $http.get('/api/static').success(function(stats) {
      $scope.statics = stats;
    });
});
