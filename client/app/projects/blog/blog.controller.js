'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, Auth, $stateParams) {
    $scope.isAuthor = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;


    $scope.load = function() {
      $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
          $scope.project = project;
          $http.get('/api/posts/project/'+$scope.project._id).success(function(posts){
              $scope.posts = posts;
          });

          if ($scope.isLoggedIn()){
            if($scope.project.authors.indexOf($scope.getCurrentUser()._id) != -1){
              $scope.isAuthor = true;
            }
            else if( $scope.isAdmin()){
              $scope.isAuthor = true;
            }
            else if($scope.getCurrentUser().role.toLowerCase() == "mentor"){
              $scope.isAuthor = true;
            }
          }

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
