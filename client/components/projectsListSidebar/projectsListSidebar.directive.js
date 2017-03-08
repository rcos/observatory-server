'use strict';

angular.module('observatory3App')
  .directive('projectsListSidebar', () => ({
    templateUrl: 'components/projectsListSidebar/projectsListSidebar.html',
    scope: {
      myProjects: '=',
      menteeProjects: '=',
      favoriteProjects: '='
    },
    restrict: 'E',
    controller: 'ProjectsListSidebarCtrl',
  }));
