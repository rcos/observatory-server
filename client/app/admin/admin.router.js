'use strict';

angular.module('observatory3App.admin')
  .config(function($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl',
        controllerAs: 'admin',
        authenticate: 'admin'
      });
  });
