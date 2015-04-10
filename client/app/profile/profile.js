'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profile', {
        url: '/users/:userUrl/profile',
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileCtrl'
      });
  });
