'use strict';

angular.module('observatory3App')
  .controller('SettingsCtrl', function ($scope, $location, User, Auth,$stateParams, $http,notify) {
    $scope.errors = {};
    $scope.token = $location.search().token;
    $scope.passwords = {};
    $scope.delete_errors = {};

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        if (!$scope.token){
          Auth.changePassword( $scope.user.oldPassword, $scope.user.password )
          .then( function() {
            $scope.message = 'Password successfully changed.';
          })
          .catch( function() {
            form.password.$setValidity('mongoose', false);
            $scope.errors.other = 'Incorrect password';
            $scope.message = '';
          });
        }else{
          Auth.changePasswordWithToken($scope.token, $scope.user.password)
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

    $scope.deleteUser = function(user,df){
      $scope.dismiss = false;
      if(df.$valid){
        Auth.deleteUser($scope.pass.currpass)
          .then(function(){
             $location.path('/main');
             df.Password.$setValidity('mongoose',false);
             Auth.logout();
             notify({message: "Account deleted"});
        })
        .catch(function(){
            df.Password.$setValidity('mongoose',false);
            $scope.delete_errors.other = 'Incorrect password'
        });
      }
    }
  });
