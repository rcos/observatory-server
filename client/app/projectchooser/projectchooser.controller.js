'use strict';

angular.module('observatory3App')
  .controller('ProjectChooserCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    $scope.defaultProjects = [];

    $scope.getDefaultProjects = function() {
        $http.get('/api/projects').success(function(projects) {
            for(var project in projects) {
                if(project.markedDefault) {
                    $scope.defaultProjects.push(project);
                }
            }
        });
    };

    $scope.getDefaultProjects();
  });
