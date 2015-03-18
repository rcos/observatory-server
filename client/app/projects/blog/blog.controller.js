'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, $stateParams) {
    $http.get('/api/posts/'+ $stateParams.username + '/' + $stateParams.project).success(function(posts){
        $scope.posts = posts;
        $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
            $scope.project = project;
        });
    });

    $scope.submit = function(form) {
        $('#post').collapse('hide');
        if(form) {
            form.$setPristine();
            form.$setUntouched();
        }
        $scope.postToAdd.date = Date.now();
        $scope.postToAdd.project = $stateParams.project;
        $http.post('/api/posts', $scope.postToAdd);
        $scope.postToAdd = {};
        $http.get('/api/posts/'+ $stateParams.username + '/' + $stateParams.project).success(function(posts){
            $scope.posts = posts;
            $scope.project = $stateParams.project;
        });
    }

    
});
