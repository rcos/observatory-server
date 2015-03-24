'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams) {
    $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
        $scope.project = project;
        $http.get('/api/commits/project/'+ String($scope.project._id)).success(function(commits){
            $scope.commits = commits;
        });
    });

});