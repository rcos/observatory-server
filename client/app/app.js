'use strict';

angular.module('observatory3App', [
  'observatory3App.auth',
  'observatory3App.admin',
  'observatory3App.constants',
  'ngCookies',
  'ngResource',
  'cgNotify',
  'ngSanitize',
  'btford.socket-io',
  'btford.markdown',
  'ui.router',
  'ui.bootstrap',
  'ngFileUpload',
  'validation.match'
])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })

  .directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind('keydown keypress', function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
