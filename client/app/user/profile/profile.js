'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profile', {
        url: '/users/:id/profile',
        templateUrl: 'app/user/profile/profile.html',
        controller: 'ProfileCtrl'
      });
  });
