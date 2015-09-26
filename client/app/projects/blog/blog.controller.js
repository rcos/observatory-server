'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, Auth, $stateParams, Project) {
    $scope.isAuthor = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.postToAdd = {};
    $scope.postToDelete = {};
    $scope.edittingPostId = -1;
    $scope.user = Auth.getCurrentUser();

    $scope.newPostIsEmpty = function() {
        return $.isEmptyObject($scope.postToAdd);
    };

    $scope.userInProject = function() {
        return $scope.isAuthor;
    };

    $scope.editPost = function(postId) {
        if ($scope.edittingPostId === postId){
            $scope.edittingPostId = -1;
        }else{
            $scope.edittingPostId = postId;
        }
    };

    $scope.edittingPost = function(postId) {
        return $scope.edittingPostId === postId;
    };

    $scope.deletePost = function(postId) {
        if (window.confirm("ARE YOU SURE?")) {
            $http.delete('/api/posts/' + postId).success(function(){
                window.alert('Post deleted!');
            }).error(function(){
                window.alert('Could not delete Post!');
            });
        }
        
        $scope.load();
    };

    var findPost = function(postId) {
        for(var i = 0; i < $scope.posts.length; i++) {
            if($scope.posts[i]._id === postId) {
                return i;
            }
        }
    };

    $scope.savePost = function() {
        if($scope.edittingPostId !== -1) {
            $http.put('/api/posts/' + $scope.edittingPostId, {
                'title': $scope.posts[findPost($scope.edittingPostId)].title,
                'content': $scope.posts[findPost($scope.edittingPostId)].content
            }).success(function(){
                window.alert('Post updated!');
            }).error(function(){
                window.alert('Could not update Post!');
            });
            $scope.edittingPostId = -1;
        }
    };

    $scope.load = function() {
      Project.getProject($stateParams.username, $stateParams.project).then(function(result){
          $scope.project = result.data;

          Project.getProjectPosts($scope.project._id).then(function(result){
              $scope.posts = result.data;
          });

          if ($scope.isLoggedIn()){
            if($scope.user.projects.indexOf($scope.project._id) !== -1){
              $scope.isAuthor = true;
            }
            else if( $scope.isAdmin()){
              $scope.isAuthor = true;
            }
            else if($scope.getCurrentUser().role.toLowerCase() === 'mentor'){
              $scope.isAuthor = true;
            }
          }

      });
    };

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
    };

    $scope.load();

  });
