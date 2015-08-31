'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('attend', {
        url: '/attend',
        templateUrl: 'app/attend/attend.html',
        controller: 'AttendCtrl'
      });
  });