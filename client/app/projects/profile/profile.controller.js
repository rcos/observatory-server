/*jshint multistr: true */
'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, Auth, $stateParams, $upload) {
    $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
        $scope.project = project;
        Auth.isLoggedInAsync(function(loggedIn){
            if (loggedIn){
                var user = Auth.getCurrentUser();
                if (user.projects.indexOf(project._id) !== -1){
                    $scope.userOnProject = true;
                }
            }
        });
    });

    $scope.imgPrefix = '/uploads/' + $stateParams.username + '/' + $stateParams.project + '/';


    $scope.edittingDesc = false;
    $scope.isLoggedIn = Auth.isLoggedIn;

    $scope.editDesc = function(){
        $scope.edittingDesc = !$scope.edittingDesc;
    };

    $scope.saveDesc = function(){
        $scope.edittingDesc = false;
        $http.put('/api/projects/' + $scope.project._id, {
            'description': $scope.project.description
        }).success(function(){
            window.alert('Description updated!');
        }).error(function(){
            window.alert('Could not update description!');
        });
    };

    $scope.joinProject = function(){
        var loggedInUser = Auth.getCurrentUser();
        $http.put("/api/users/" + loggedInUser._id + "/project",{
            "project": $scope.project._id
        }).success(function(){
            window.alert("You are now on this project!");
            $scope.userOnProject = true;
        }).error(function(){
            window.alert("Error adding user to project!");
        });
    };

    $scope.leaveProject = function(){
        var loggedInUser = Auth.getCurrentUser();
        $http.delete("/api/users/" + loggedInUser._id + "/project",{
            "project": $scope.project._id
        }).success(function(){
            window.alert("You are now off this project!");
            $scope.userOnProject = false;
        }).error(function(){
            window.alert("Error removing user from project!");
        });
    };


    $scope.userInProject = function() {
        return true; // delete when we get people in projects
        // return $scope.project.authors.indexOf(Auth.getCurrentUser()._id) !== -1;
    };

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
    };
})
.directive('desc', function() {
      return {
          restrict:'E',
          template: '<div btf-markdown=\'project.description\'></div> \
                     <textarea ng-show=\'edittingDesc && userInProject()\' ng-model=\'project.description\' ></textarea>'
      };
});
