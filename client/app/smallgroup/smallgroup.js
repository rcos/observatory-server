'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('smallgroup', {
        url: '/smallgroup',
        templateUrl: 'app/smallgroup/smallgroup.html',
        controller: 'SmallGroupCtrl'
      });
  });
