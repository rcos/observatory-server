'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams) {
    $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
        $scope.project = project;
    }); 

    $scope.users = [];

    $http.get('/api/users/stats').success(function(users){
        $scope.users = users;
    });

    $scope.submit = function() {
        $http.put('/api/projects/' + $scope.project._id, $scope.project);
        $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
            $scope.project = project;
        }); 
    };
});
