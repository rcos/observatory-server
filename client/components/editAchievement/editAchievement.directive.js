'use strict';

angular.module('observatory3App')
  .directive('editAchievement', function() {
    return {
      templateUrl: 'components/editAchievement/editAchievement.html',
      controller: 'EditAchievementCtrl',
      restrict: 'E',
      scope: {
        achievement: '=',
        achievements: '='
      }
    };
  });
