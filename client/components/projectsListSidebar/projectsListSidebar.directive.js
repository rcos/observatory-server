'use strict';

angular.module('observatory3App')
  .directive('projectsListSidebar', () => ({
    templateUrl: 'components/projectsListSidebar/projectsListSidebar.html',
    restrict: 'E',
    controller: 'ProjectsListSidebarCtrl',
  }));
