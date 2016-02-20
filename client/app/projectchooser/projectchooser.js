'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('projectchooser', {
        url: '/projectchooser',
        templateUrl: 'app/projectchooser/projectchooser.html',
        controller: 'ProjectChooserCtrl'
      });
  });