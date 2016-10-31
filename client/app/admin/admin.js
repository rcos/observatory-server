'use strict';

angular.module('observatory3App.admin', [
  'observatory3App.auth',
  'ui.router'
])
  .config(function($stateProvider) {
    $stateProvider
      .state('adminUsers', {
        url: '/admin/users',
        templateUrl: 'app/admin/users/users.html',
        controller: 'AdminCtrl',
        controllerAs: 'admin',
        authenticate: 'admin'
      })
      .state('adminAttendance', {
        url: '/admin/attendance',
      	templateUrl: 'app/admin/attendance/attendance.html',
        controller: 'AdminAttendanceCtrl',
        controllerAs: 'admin',
        authenticate: 'admin'
      })
      .state('adminSettings', {
        url: '/admin/settings',
      	templateUrl: 'app/admin/settings/settings.html',
        controller: 'AdminSettingsCtrl',
        controllerAs: 'admin',
        authenticate: 'admin'
      });
  });
