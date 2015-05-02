'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams, $upload, Auth) {
    $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
      $scope.project = project;
    });

    $scope.imgPrefix = "/uploads/" + $stateParams.username + '/' + $stateParams.project + '/';


    $scope.edittingDesc = false;

    $scope.editDesc = function(){
        $scope.edittingDesc = !$scope.edittingDesc;
    };

    $scope.saveDesc = function(){
        $scope.edittingDesc = false;
        $http.put("/api/projects/" + $scope.project._id, {
            "description": $scope.project.description
        }).success(function(){
            alert("Description updated!");
        }).error(function(){
            alert("Could not update description!");
        });
    };


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
})
.directive("desc", function() {
      return {
          restrict:'E',
          template: "<div btf-markdown='project.description'></div> \
                     <textarea ng-show='edittingDesc && userInProject()' ng-model='project.description' ></textarea>"
      }
});
