'use strict';

angular.module('observatory3App.auth', [
  'observatory3App.constants',
  'observatory3App.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
