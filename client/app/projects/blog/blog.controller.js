'use strict';

angular.module('observatory3App')
.controller('ProjectsBlogCtrl', function ($scope, $http, $stateParams, $uibModal, $anchorScroll, $location, Auth, Project, notify) {
    $scope.isAuthor = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.user = Auth.getCurrentUser();

    $scope.userInProject = function() {
        return $scope.isAuthor;
    };

    $scope.userOwnsPost = function(post) {
        if($scope.user._id){
          var userId = $scope.user._id;
          return ($scope.isAdmin() || $scope.getCurrentUser().role.toLowerCase() === 'mentor' || userId === post.author._id);
        }
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
        if (window.confirm('Are you sure you want to delete this post?')) {
            $http.delete('/api/posts/' + post._id).success(function(){
                notify('Post deleted!');
            }).error(function(){
                notify('Could not delete Post!');
            });
        }

        $scope.load();
    };

    $scope.goto = function(id){
      $location.hash(id);
      if($location.hash()!==id){
        $location.hash(id);
      }else{
        $anchorScroll();
      }
    };

    var sortPosts = function(){
      $scope.semesters = {};
      $scope.listOfsem = [];
      for(var i =$scope.posts.length-1; i >-1 ; --i){
        var postDate = $scope.posts[i].date;
        var year = postDate.substring(0,4);
        var semester = '';
        if(postDate.charAt(5) > 0 || postDate.charAt(6) > 7){
          semester = 'Fall';
        }else{
          semester = 'Spring';
        }
        semester = semester + ' '+year;
        if(!$scope.semesters.hasOwnProperty(semester)){
          $scope.semesters[semester] = [];
          $scope.listOfsem.push(semester);
        }
        $scope.semesters[semester].push($scope.posts[i]);
      }
      $scope.listOfsem.sort(semesterComparator);
    };

    var semesterComparator = function(s1,s2){
      var s1parts = s1.split(" ");
      var s2parts = s2.split(" ");
      if(s1parts[1] === s2parts[1]){
        return s1parts[0] === "Spring" ? 1 : -1;
      }
      return s1parts[1] < s2parts[1] ? 1 : -1;
    };

    $scope.load = function() {
      Project.getProject($stateParams.username, $stateParams.project).then(function(result){
          $scope.project = result.data;

          Project.getProjectPosts($scope.project._id).then(function(result){
              $scope.posts = result.data;
              sortPosts();
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
    $scope.readOnly = function(){
      return false;
    }
    $scope.load();

  });
