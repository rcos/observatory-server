'use strict';

angular.module('observatory3App')
  .controller('UserCtrl', function ($scope, $http) {
    $scope.users = User.query();
  });
