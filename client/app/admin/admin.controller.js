'use strict';

angular.module('observatory3App')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, Util, notify, $location) {
    $scope.past = {active: true };
    $scope.sortorder = 'name';

    if (Auth.isLoggedIn()){
      var loggedInUser = Auth.getCurrentUser();

          if(loggedInUser.role!=='admin'){
            $location.path('/');
          }
          else{
            // Use the User $resource to fetch all users

            $scope.users = [];
            $scope.allUsers = [];
            User.allstats({},function(users){
                $scope.allUsers = users;
                $scope.users = $scope.getUsersActive(true);

                var a = 0;
                for (a = 0; a < $scope.allUsers.length; a++){
                  Util.parseAttendance($scope.allUsers[a]);
                }
                for (a = 0; a < $scope.allUsers.length; a++){
                  $scope.allUsers[a].activeChange = $scope.allUsers[a].active;
                }
            }, function(){
            });

          }
    }
    else{
      $location.path('/');
    }

    $scope.getUsersActive = function(active){
      return $scope.allUsers.reduce(function(previous, current){
        if (current.active === active){
          return previous.concat(current);
        }
        else{
          return previous;
        }
      },[]);
    };

    $scope.updateUserRole = function(user) {
      $http.post('/api/users/' + user._id + '/role', {
            role: user.role
        }).success(function() {
          notify('Updated user role.');
        }).error(function() {
          notify('Unable to set user role');
        });
    };

    $scope.viewActive = function(view){
      $scope.past.active = view;
      $scope.users = $scope.getUsersActive(view);
    };

    $scope.toggle = function(user){
        $scope.submit(user, !user.active);
    };

    $scope.submitAll = function(){
      for (var a = 0; a < $scope.allUsers.length; a++){
        if ($scope.allUsers[a].activeChange !== $scope.allUsers[a].active){
          $scope.submit($scope.allUsers[a],$scope.allUsers[a].activeChange);
        }
      }
      $scope.viewActive($scope.past.active);
    };

    $scope.activateAll = function(activate){
      for (var a = 0; a < $scope.allUsers.length; a++){
        if ($scope.allUsers[a].active !== activate){
          $scope.submit($scope.allUsers[a],activate);
        }
      }
      $scope.viewActive(activate);
    };

    $scope.submit = function(user,activate){
      var endpoint =  '/deactivate';
      if(activate === true){
        endpoint = '/activate';
      }
      user.active = activate;
      user.activeChange = activate;

      $http.put('/api/users/' + user._id + endpoint).success(function(message){
        if (message.success){
          angular.forEach($scope.users, function(u) {
            if (u._id === user._id) {
              u.active = activate;
              u.activeChange = activate;
            }
          });
        }
      });
    };
  });
