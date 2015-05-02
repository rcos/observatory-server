'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, Auth, $stateParams) {
    $scope.isAuthor = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.postToAdd = {};
    $scope.edittingPostId = -1;

    $scope.newPostIsEmpty = function() {
        return $.isEmptyObject($scope.postToAdd);
    }

    $scope.userInProject = function() {
        return true; // delete when we get people in projects
        return $scope.project.authors.indexOf(Auth.getCurrentUser()._id) !== -1;
    }

    $scope.editPost = function(postId) {
        $scope.edittingPostId === postId ? $scope.edittingPostId = -1 : $scope.edittingPostId = postId;
    }

    $scope.edittingPost = function(postId) {
        return $scope.edittingPostId === postId;
    }

    var findPost = function(postId) {
        for(var i = 0; i < $scope.posts.length; i++) {
            if($scope.posts[i]._id === postId) {
                return i;
            }
        }
    }

    $scope.savePost = function(postId) {
        if($scope.edittingPostId !== -1) {
            $http.put("/api/posts/" + $scope.edittingPostId, {
                "title": $scope.posts[findPost($scope.edittingPostId)].title,
                "content": $scope.posts[findPost($scope.edittingPostId)].content
            }).success(function(){
                alert("Post updated!");
            }).error(function(){
                alert("Could not update Post!");
            });
            $scope.edittingPostId = -1;
        }
    }

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
