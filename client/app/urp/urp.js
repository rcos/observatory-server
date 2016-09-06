'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('urp', {
        url: '/urp',
        templateUrl: 'app/urp/urp.html',
        controller: 'URPCtrl'
      });
  });
