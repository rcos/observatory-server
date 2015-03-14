'use strict';

angular.module('observatory3App')
  .controller('UserCtrl', function ($scope, $http) {
    $scope.users = [];

    $http.get('/api/users/stats').success(function(users){
        $scope.users = users;
    })
  });
