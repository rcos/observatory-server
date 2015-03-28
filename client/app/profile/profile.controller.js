'use strict';

angular.module('observatory3App')
  .controller('ProfileCtrl', function ($scope, $stateParams, $http, Auth) {

      var loggedInUser = Auth.getCurrentUser();
      $scope.isuser = loggedInUser._id == $stateParams.id;

      $http.get('/api/users/' + $stateParams.id).success(function(user){
          $scope.user = user;
          $http.get('/api/commits/user/' + user.githubProfile).success(function(commits){
              $scope.user.commits = commits;
          });
      });

      $scope.edittingBio = false;

      $scope.editBio = function(){
          $scope.edittingBio = !$scope.edittingBio;
      };

      $scope.saveBio = function(){
          $scope.edittingBio = false;
          $http.put("/api/users/" + $stateParams.id + "/bio", {
              "bio": $scope.user.bio
          }).success(function(){
              alert("Bio updated!");
          }).error(function(){
              alert("Could not update bio!");
          });
      };

  })
  .directive("bio", function(){

      function link(scope, element, attrs){

          function updateEditable(){
              if (scope.edittingBio){
                  $(element).find("div").hide();
                  $(element).find("textarea").show();
              }else{
                  $(element).find("div").show();
                  $(element).find("textarea").hide();
              }
          }

          scope.$watch("edittingBio", updateEditable);

          $(element).keyup(function(){
              if (!scope.edittingBio) return;
              // Wait a bit for the character to be placed in the div
              setTimeout(function(){
                  // update the value of user.bio
                  scope.user.bio = $(element).find("textarea").val();
              },100);
          });

      }

      return {
          restrict:'E',
          template: "<div style='white-space:pre;'>{{user.bio}}</div> \
                     <textarea>{{user.bio}}</textarea>",
          link:link
      }
  });
