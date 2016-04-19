'use strict';

angular.module('observatory3App')
.controller('ForgotPasswordCtrl', function ($scope, Auth) {
  $scope.user = {};
  $scope.errors = {};

  $scope.forgotPassword = function(form) {
    $scope.submitted = true;

    if(form.$valid) {
      Auth.resetPassword($scope.user.email)
        .then( function(){
          $scope.success = true;
        }).catch(function(err) {
          $scope.errors.other = err;
        });
    }
  };

});
