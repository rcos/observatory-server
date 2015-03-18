'use strict';

angular.module('observatory3App')
  .controller('UserCtrl', function ($scope, $http, Auth, User) {
    $scope.users = User.query();
  });
