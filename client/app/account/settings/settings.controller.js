'use strict';

angular.module('observatory3App')
  .controller('SettingsCtrl', function ($scope, $location, User, Auth) {
    $scope.errors = {};
    $scope.token = $location.search().token;

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        if (!$scope.token){
          Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
          .then( function() {
            $scope.message = 'Password successfully changed.';
          })
          .catch( function() {
            form.password.$setValidity('mongoose', false);
            $scope.errors.other = 'Incorrect password';
            $scope.message = '';
          });
        }else{
          Auth.changePasswordWithToken($scope.token, $scope.user.newPassword)
            .then( function() {
              $scope.message = 'Password changed successfully';
            })
            .catch (function(){
              $scope.errors.other = 'An error occurred';
              $scope.message = '';
            });
        }
      }
		};
  });
