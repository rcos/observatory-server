'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      })
      .state('adminclasscontrol', {
      	url: '/admin/classcontrol',
      	templateUrl: 'app/admin/classcontrol/classcontrol.html',
      	controller: 'AdminClassControlCtrl'
      });
  });