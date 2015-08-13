'use strict';

angular.module('observatory3App')
  .controller('ForgotPasswordCtrl', function ($scope, Auth) {
    $scope.user = {};
    $scope.errors = {};

    $scope.forgotPassword = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.resetPassword($scope.user.email, function(err){
          if (err){
            $scope.errors.other = err;
          }else{
            $scope.success = true;
          }
        });
      }
    };

  });
