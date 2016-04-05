'use strict';

angular.module('observatory3App')
  .controller('AttendCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify, focus) {
    // put text focus on day code
    focus('dayCodeInput');
    $scope.sortorder = '-datetime';

    var load = function(){
      $http.get('/api/attendance/present/me')
      .success(function(submissions){
          $scope.previousSubmissions = submissions;
      }).error(function(err){
          $scope.previousSubmissions = [];
      });
    };

    $scope.submitDayCode = function(){
      var user = Auth.getCurrentUser();
      $http.post('/api/attendance/attend', {
        dayCode: $scope.userDayCode
      }).success(function(info){
        if (info.unverified){
          $scope.unverified = true;
        }else{
          notify("Day code submitted successfully!");
          $scope.userDayCode = '';
        }
          load();
      }).error(function(err){
        notify({ message: "Error: " + err, classes: ["alert-danger"] });
        load();
      });
    };

    load();
  });
