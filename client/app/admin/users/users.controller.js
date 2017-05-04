'use strict';

angular.module('observatory3App')
  .controller('AdminCtrl', function ($scope, $http, $uibModal, Auth, User, Util, notify, $location) {
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
                $http.get('/api/attendance/')
                .success(function(attendance){
                    $scope.attendance = attendance;
                    $scope.users = $scope.getUsersActive(true);

                    var a = 0;
                    for (a = 0; a < $scope.allUsers.length; a++){
                      Util.parseAttendanceFromAll($scope.allUsers[a],$scope.attendance);
                    }
                    for (a = 0; a < $scope.allUsers.length; a++){
                      $scope.allUsers[a].activeChange = $scope.allUsers[a].active;
                    }

                }).error(function(){
                    $scope.attendance = [];
                });

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

    $scope.addAttendence = function(user){
      $http.get('/api/users/'+user._id+ '/private')
      .success(function(aUser){
        $uibModal.open({
          templateUrl: 'components/addAttendance/addAttendance.html',
          controller: 'addAttendanceController',
          backdrop : 'static',
          resolve : {
            user: aUser
          }
        });
      }).error(function(){
          notify('unable to open calendar');
      });
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

    $scope.confirmDeativate=function(){
      $scope.msg = {value:'Confirm deactivate all user?' };
      $uibModal.open({
        templateUrl: 'components/confirmDialog/confirmDialog.html',
        controller: 'confirmDialogCtrl',
        size: 'sm',
        resolve : {
          msg : $scope.msg
        }
      }).result.then(function(result){
        $scope.value = result;
        if(result){
          $scope.activateAll(false);
        }
      });
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
