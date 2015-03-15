'use strict';

angular.module('observatory3App')
  .controller('ProfileCtrl', function ($scope, $stateParams, $http) {
      $http.get('/api/users/' + $stateParams.id).success(function(user){
          $scope.user = user;
      });
  });
