'use strict';

angular.module('observatory3App')
.controller('ProjectsListSidebarCtrl',
    function ($scope, Auth) {
      $scope.isMentor = Auth.isMentor;
    });
