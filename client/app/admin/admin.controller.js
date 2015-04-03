'use strict';

angular.module('observatory3App')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = [];
    $scope.users = User.allstats();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.deactivate = function(user){
      $http.put('/api/users/' + user._id + '/deactivate').success(function(message){
        if (message.success){
          angular.forEach($scope.users, function(u, i) {
            if (u._id === user._id) {
              $scope.users.splice(i, 1);
            }
          });
        }
      });
    };

    $scope.toggle = function(user){
      var endpoint =  '/deactivate'
      if(user.active == false){
        endpoint = '/activate'
      }
      $http.put('/api/users/' + user._id + endpoint).success(function(message){
        if (message.success){
          angular.forEach($scope.users, function(u, i) {
            if (u._id === user._id) {
              u.active = !user.active ;
            }
          });
          }
    });

  }

    $scope.sortorder = 'name';

    $scope.setSortOrder = function(field){
      if (field === $scope.sortorder){
        $scope.sortorder = '-' + field;
      } else{
        $scope.sortorder = field;
      }
    };

    $scope.setAttendance = function(attendanceCode){
        $http.put("/api/users/setAttendance", {
            "code": attendanceCode
        }).success(function(){
            alert("yea");
        }).error(function(){
            alert("Error in setting");
        });
    };
  });
