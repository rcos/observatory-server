'use strict';

angular.module('observatory3App')
  .controller('ProjectChooserCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    $scope.defaultProjects = [];

    $scope.getDefaultProjects = function() {
        $http.get('/api/projects/defaults').success(function(projects) {
            $scope.defaultProjects = projects;
            /*
            for(var project in projects) {
                console.log("looking at project " + project._id);
                console.log(project.markedDefault);
                if(project.markedDefault) {
                    $scope.defaultProjects.push(project);
                    console.log("test");
                }
            }
        */
        });
    };

    $scope.getDefaultProjects();

    $scope.getImagePrefix = function(project) {
        return '/uploads/' + project.username + '/' + project.project + '/';
    };

  });
