'use strict';

angular.module('observatory3App')
.controller('ForgotPasswordCtrl', function ($scope, Auth, notify) {
  $scope.user = {};
  $scope.errors = {};

  $scope.forgotPassword = function(form) {
    $scope.submitted = true;

    if(form.$valid) {
      Auth.resetPassword($scope.user.email, function(err, res){
        if (!err){
          $scope.success = true;
        }
        else {
          notify({ message: "Error: Problem Sending Password Reset Email", classes: ["alert-danger"] });
        }
      });
    }
  };
});
