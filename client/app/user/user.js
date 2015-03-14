'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('user', {
        url: '/users',
        templateUrl: 'app/user/user.html',
        controller: 'UserCtrl'
      });
  });