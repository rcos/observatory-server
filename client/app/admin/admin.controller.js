'use strict';

angular.module('observatory3App')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Util, notify, $location) {

    if (Auth.isLoggedIn()){
      var loggedInUser = Auth.getCurrentUser();

          if(loggedInUser.role!=='admin'){
            $location.path('/');
          }
          else{
            // Use the User $resource to fetch all users

            $scope.users = [];
            User.allstats({},function(users){
                $scope.users = users;

                for (var a = 0; a < $scope.users.length; a++){
                  Util.parseAttendance($scope.users[a]);
                }
            }, function(){
            });

          }
    }
    else{
      $location.path('/');
    }

    $scope.updateUserRole = function(user) {

      $http.post('/api/users/' + user._id + '/role', {
            role: user.role
        }).success(function() {
          notify('Updated user role.');
        }).error(function() {
          notify('Unable to set user role');
        });
    };

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
      var endpoint =  '/deactivate';
      if(user.active === false){
        endpoint = '/activate';
      }
      $http.put('/api/users/' + user._id + endpoint).success(function(message){
        if (message.success){
          angular.forEach($scope.users, function(u) {
            if (u._id === user._id) {
              u.active = !user.active;
            }
          });
        }
      });
    };

    $scope.sortorder = 'name';

  });
