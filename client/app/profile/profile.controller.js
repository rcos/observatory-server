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
          console.log($scope.user.bio);
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
                  $(element).attr("contenteditable","true");
              }else{
                  $(element).attr("contenteditable","false");
              }
          }

          scope.$watch("edittingBio", updateEditable);

          $(element).keyup(function(){
              // Wait a bit for the character to be placed in the div
              setTimeout(function(){
                  // update the value of user.bio
                  scope.user.bio = $($(element)[0].innerHTML.replace(/<br>/g,"\n")).text();
              },100);
          });

      }

      return {
          restrict:'E',
          template: "<div style='white-space:pre;'>{{user.bio}}</div>",
          link:link
      }
  });
