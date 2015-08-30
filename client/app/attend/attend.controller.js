'use strict';

angular.module('observatory3App')
  .controller('AttendCtrl', function ($scope, $stateParams, $http, Auth, User, $location) {
    $scope.submitDayCode = function(){
      var user = Auth.getCurrentUser();
      $http.put('/api/users/' + user._id + '/attend', {
        dayCode: $scope.userDayCode
      }).success(function(){
        window.alert("Day code submitted successfully!");
      }).error(function(err){
        window.alert("Error: " + err);
      });
    };
  });
