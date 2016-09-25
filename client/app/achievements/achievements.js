'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('achievements', {
        url: '/achievements',
        templateUrl: 'app/achievements/achievements.html',
        controller: 'AchievementsCtrl'
      });
  });
