'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mentor', {
        url: '/mentor',
        templateUrl: 'app/mentor/mentor.html',
        controller: 'MentorCtrl'
      });
  });