'use strict';

angular.module('observatory3App')
.controller('ProjectsListSidebarCtrl',
    function ($scope, Auth, Project) {
      $scope.isMentor = Auth.isMentor;

      if ($scope.loggedIn()) {
        Project.getMyProjects().success(function(projects){
          $scope.myProjects = projects;
        });
      }
      if ($scope.isMentor()){
        Project.getMenteesProjects().success(function(projects){
          $scope.menteeProjects = projects;
        });
      }
    });
