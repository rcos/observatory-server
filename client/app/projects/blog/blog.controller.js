'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, $stateParams) {
    $scope.load = function() {
      $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
          $scope.project = project;
          $http.get('/api/posts/project/'+$scope.project._id).success(function(posts){
              $scope.posts = posts;
          });
      });
    }

    $scope.submit = function(form) {
        $('#post').collapse('hide');
        if(form) {
            form.$setPristine();
            form.$setUntouched();
        }
        $scope.postToAdd.date = Date.now();
        $scope.postToAdd.projectId = $scope.project._id;
        $http.post('/api/posts', $scope.postToAdd);
        $scope.postToAdd = {};
        $scope.load();
    }

    $scope.load();


});
