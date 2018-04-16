'use strict';

angular.module('observatory3App')
  .config(function($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('sponsors', {
        url: '/sponsors',
        templateUrl: 'app/main/sponsors.html',
        controller: 'MainController'
      })
  });
