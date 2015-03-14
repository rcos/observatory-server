'use strict';

angular.module('observatory3App')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();

    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.deactivate = function(userId){
      $http.put('/api/users/' + userId + '/deactivate').success(function(message){
        console.log(message);
        if (message.success){
          angular.forEach($scope.users, function(u, i) {
            if (u._id === userId) {
              $scope.users.splice(i, 1);
            }
          });
        }
      });
    }
  });
