'use strict';

angular.module('observatory3App')
  .controller('AchievementsCtrl', function ($scope, Auth, uibDateParser, Achievement) {
    $scope.achievements = Achievement.query();

    $scope.achievement = {};

    $scope.delete = function(ach) {
      ach.$delete(function() {
        $scope.achievements = Achievement.query();
      });
    };

    $scope.edit = function(ach) {
      $scope.achievement = ach;
    };

    $scope.isAdmin = Auth.isAdmin;
  });
