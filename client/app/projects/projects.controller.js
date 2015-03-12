'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, $http) {
    $scope.projects = [];

    $http.get('/api/projects').success(function(projects) {
        $scope.projects = projects;
    });

    $scope.projectToAdd = {};

    $scope.submit = function(form) {
        $('#addProject').modal('hide');
        if(form) {
            form.$setPristine();
            form.$setUntouched();
        }
        // use setTimeout because hiding the modal takes longer than the post request
        // and results in the modal disappearing but the overlay staying if not used
        setTimeout(function() {
            $http.post('/api/projects', $scope.projectToAdd);
            $scope.projectToAdd = {};
            $http.get('/api/projects').success(function(projects) {
                $scope.projects = projects;
            });
        }, 200);
    }
});
