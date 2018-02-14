'use strict';

angular.module('observatory3App')
  .controller('LoginController', function ($scope, Auth, $location, focus, $stateParams) {
    $scope.user = {};
    $scope.errors = {};

    focus('email');

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          if ($stateParams.referrer) {
            // go to the referral url
            var ref = $stateParams.referrer;
            $location.search('referrer', null);
            $location.path(ref, null);
          }
          else {
            // Logged in, redirect to home
            $location.path('/');
          }
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    // Check URL for token
    if ($location.search().token){
      // Attempt to login with token
      var token = $location.search().token;
      Auth.loginWithResetToken(token)
        .then(function(){
          $location.path('/settings'); // allow user to change password
        });
    }
  });
