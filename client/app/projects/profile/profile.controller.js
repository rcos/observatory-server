'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams, $upload, Auth) {
    $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
      $scope.project = project;
    });

    $scope.imgPrefix = "/uploads/" + $stateParams.username + '/' + $stateParams.project + '/';

    $scope.userInProject = function() {
        return true; // delete when we get people in projects
        return $scope.project.authors.indexOf(Auth.getCurrentUser()._id) !== -1;
    }

    $scope.onFileSelect = function($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];
            $upload.upload({
                url: 'api/projects/'+$stateParams.username+'/'+$stateParams.project+'/upload',
                file: $file
            });
        }
        $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
            $scope.project = project;
        });
    }
});
