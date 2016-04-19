'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('projects', {
        url: '/projects',
        templateUrl: 'app/projects/projects.html',
        controller: 'ProjectsCtrl'
      })
      .state('projectsState', {
        url: '/projects/:state',
        templateUrl: 'app/projects/projects.html',
        controller: 'ProjectsCtrl'
      })
      .state('projectsprofile', {
        url: '/projects/:username/:project/profile',
        templateUrl: 'app/projects/profile/profile.html',
        controller: 'ProjectsProfileCtrl'
      })
      .state('projectsblog', {
        url: '/projects/:username/:project/blog',
        templateUrl: 'app/projects/blog/blog.html',
        controller: 'ProjectsBlogCtrl'
      });
  });
