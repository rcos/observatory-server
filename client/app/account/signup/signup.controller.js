'use strict';

angular.module('observatory3App')
  .controller('SignupCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.createUser({
          name: $scope.user.name,
          email: $scope.user.email,
          github: {
            login: $scope.user.githubLogin,
          },
          rin: parseInt($scope.user.rin),
          rcsId: $scope.user.rcs,
          semesterCount: parseInt($scope.user.semesters),
          password: $scope.user.password,
        })
        .then( function() {
          // Account created, redirect to home
          $location.path("/users/"+$scope.user.githubLogin+"/profile");
        })
        .catch( function(err) {
          err = err.data;
          console.log(err);
          $scope.errors = {};

          // Update validity of form fields that match the mongoose errors
          angular.forEach(err.errors, function(error, field) {
            form[field].$setValidity('mongoose', false);
            $scope.errors[field] = error.message;
          });
        });
      }
    };

  });
