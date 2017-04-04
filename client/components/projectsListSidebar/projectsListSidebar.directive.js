'use strict';

angular.module('observatory3App')
  .directive('projectsListSidebar', () => ({
    templateUrl: 'components/projectsListSidebar/projectsListSidebar.html',
    scope: {
      markNotFavorite: '=',
      myProjects: '=',
      menteeProjects: '=',
      favoriteProjects: '='
    },
    restrict: 'E',
    controller: 'ProjectsListSidebarCtrl',
  }));
