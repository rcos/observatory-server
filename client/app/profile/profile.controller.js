'use strict';

angular.module('observatory3App')
  .controller('ProfileCtrl', function ($scope, $stateParams, $http) {
      $http.get('/api/users/' + "5504fb5c2cc6584434c49600").success(function(user){
          $scope.user = user;
      });
  });
