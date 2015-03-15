'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('projects', {
        url: '/projects',
        templateUrl: 'app/projects/projects.html',
        controller: 'ProjectsCtrl'
      })
      .state('projectsprofile', {
        url: '/projects/:username/:project/profile',
        templateUrl: 'app/projects/profile/profile.html',
        controller: 'ProjectsProfileCtrl'
      });
  });