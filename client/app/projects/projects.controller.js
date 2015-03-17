'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, $http) {
    $scope.projects = [];
    $scope.projectToAdd = {active: true};

    $scope.getCurrentProjects = function() {
        $http.get('/api/projects').success(function(projects) {
            $scope.projects = projects;
        });
        $scope.past = false;
    };

    $scope.getPastProjects = function() {
        $http.get('/api/projects/past').success(function(projects) {
            $scope.projects = projects;
        });
        $scope.past = true;
    };

    $scope.submit = function(form) {
        $('#addProject').modal('hide');
        if(form) {
            form.$setPristine();
            form.$setUntouched();
        }
        // use setTimeout because hiding the modal takes longer than the post request
        // and results in the modal disappearing but the overlay staying if not used
        setTimeout(function() {
            $scope.projectToAdd.repositoryUrl = "https://github.com/" + $scope.projectToAdd.githubUsername + "/" + $scope.projectToAdd.githubProjectName;
            $http.post('/api/projects', $scope.projectToAdd);
            $scope.projectToAdd = {active: true};
            $scope.past ? $scope.getPastProjects() : $scope.getCurrentProjects();
        }, 200);
    }

    $scope.getCurrentProjects(); // update the webpage when connecting the controller
});
