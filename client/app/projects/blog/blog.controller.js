'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, $stateParams, $uibModal, Auth, Project, notify) {
    $scope.isAuthor = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.user = Auth.getCurrentUser();
    $scope.viewAll = true;
    $scope.semester = "Spring";
    $scope.year = 2016;

    $scope.userInProject = function() {
        return $scope.isAuthor;
    };

    $scope.userOwnsPost = function(post) {
        var userId = $scope.user._id;
        return ($scope.isAdmin() || $scope.getCurrentUser().role.toLowerCase() === 'mentor' || userId === post.author._id);
    };

    $scope.editPost = function(post) {
      var modalInstance = $uibModal.open({
        templateUrl: 'components/editBlog/editBlog.html',
        controller: 'blogEditController',
        backdrop : 'static',

        resolve: {
          editBlog: function () {
            return  post;
          },
          projectId: function() {
            return $scope.project._id;
          }
        }
      });

      modalInstance.result.then(function () {
        // $window.location.reload();
        $scope.load();
      }, function(){
        $scope.load();

      });

    };

    $scope.addBlogPost = function(){
      var modalInstance = $uibModal.open({
        templateUrl: 'components/editBlog/editBlog.html',
        controller: 'blogEditController',
        backdrop : 'static',

        resolve: {
          editBlog: function () {
            return  null;
          },
          projectId: function() {
            return $scope.project._id;
          }
        }
      });

      modalInstance.result.then(function () {
        // $window.location.reload();
        $scope.load();
      }, function(){
        $scope.load();

      });
    };

    $scope.deletePost = function(post) {
        if (window.confirm("Are you sure you want to delete this post?")) {
            $http.delete('/api/posts/' + post._id).success(function(){
                notify('Post deleted!');
            }).error(function(){
                notify('Could not delete Post!');
            });
        }

        $scope.load();
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

    $scope.toggleViewAll = function() {
        $scope.viewAll = !$scope.viewAll;          
    };

    $scope.decrement = function() {
        if $scope.semester == "Spring" {
            $scope.semester = "Fall";
            $scope.year = toString(parseInt($scope.year))--;
        }
        else if $scope.semester == "Fall"
            $scope.semester = "Summer";
        else if $scope.semester == "Summer"
            $scope.semester = "Spring";
    }

    $scope.increment = function() {
        if $scope.semester == "Spring" 
            $scope.semester = "Summer";
        else if $scope.semester == "Summer"
            $scope.semester = "Fall";
        else if $scope.semester == "Fall" {
            $scope.semester = "Spring";
            $scope.year = toString(parseInt($scope.year))++;
        }
    }

    $scope.load();

  });
