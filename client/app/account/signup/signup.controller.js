'use strict';

angular.module('observatory3App')
  .controller('SignupCtrl', function ($scope, Auth, $location, focus) {
    $scope.user = {};
    $scope.errors = {};

    focus('name');

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          github: {
            login: $scope.user.githubLogin
          },
          password: $scope.user.password

        })
        .then( function() {
          // Account created, redirect to project chooser
          $location.path('/projectchooser');
        })
        .catch( function(err) {
          err = err.data;
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

  })
  .directive('matchField', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.matchField = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (modelValue == scope.user[attrs.matchField]) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };
    }
  };
});
