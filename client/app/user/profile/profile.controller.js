/*jshint multistr: true */
'use strict';

angular.module('observatory3App')
  .controller('ProfileCtrl', function ($scope, $stateParams, $http, Auth, notify) {

      var loggedInUser;
      Auth.getCurrentUser(function(user){
        loggedInUser = user;
        $scope.isuser = loggedInUser._id === $stateParams.id;
        $scope.loggedInUserRole = loggedInUser.role;
      });

      $http.get('/api/users/' + $stateParams.id).success(function(user){
          $scope.user = user;
          $scope.originalRole = user.role;
          $http.get('/api/commits/user/' + user.githubProfile).success(function(commits){
              $scope.user.commits = commits;
          });
          // get all users projects information
          $scope.projects = [];
          user.projects.forEach(function(projectId){
            $http.get("/api/projects/" + projectId).success(function(project){
              $scope.projects.push(project);
            });
          });
      });

      $scope.edittingBio = false;

      $scope.editBio = function(){
          $scope.edittingBio = !$scope.edittingBio;
      };

      $scope.saveBio = function(){
          $scope.edittingBio = false;
          $http.put('/api/users/' + $stateParams.id + '/bio', {
              'bio': $scope.user.bio
          }).success(function(data){
              $scope.user.bio = data.bio;
              notify({message: "Bio updated!", classes: []});
          }).error(function(){
              notify({message: "Could not update bio!", classes: ["alert-danger"]});
          });
      };

      $scope.edittingGithub = false;

      $scope.editGithub = function(){
        $scope.edittingGithub = !$scope.edittingGithub;
      };

      $scope.saveGithub = function(){
        $scope.edittingGithub = false;
        $http.put('/api/users/' + $stateParams.id + '/github',{
            'github': $scope.user.githubProfile
        }).success(function(data){
            $scope.user.githubProfile = data.githubProfile;
            notify({message: "Github updated!", classes: []});
        }).error(function(){
          notify({message: "Could not update Github!", classes: ["alert-danger"]});
        });
      };

      $scope.addTech = function(){
        if($scope.insertTechContent){
          $http.put('/api/users/' + $stateParams.id + '/addTech', {
              'tech': $scope.insertTechContent
          }).success(function(){
              $scope.user.tech.push($scope.insertTechContent);
              $scope.insertTechContent = '';
          }).error(function(){
              notify({message: "Could not add tech!", classes: ["alert-danger"]});
          });
        }
      };

      $scope.removeTech = function(tech){
          $http.put('/api/users/' + $stateParams.id + '/removeTech', {
              'tech': tech
          }).success(function(){
              $scope.user.tech.splice($scope.user.tech.indexOf(tech),1);
          }).error(function(){
              notify({message: "Could not add tech!", classes: ["alert-danger"]});
          });
      };

      $scope.deleteUser = function(user){
         
          $http.put('/api/users/' + $stateParams.id + '/removeUser', {
              'user': user
          })
          .success(function(){
              Auth.logout();
              notify({message: "Account deleted"}); 
             $http.get("/api/main");
             
          }) .error(function(){
              notify({message: "Could not delete!", classes: ["alert-danger"]});
      });
    }

      $scope.setRole = function(){
        // $scope.user.role
        $http.post('/api/users/' + $stateParams.id + '/role', {
            role: $scope.user.role
        }).success(function(){
          $scope.originalRole = $scope.user.role;
        });
      }
  })

  .directive('bio', function(){

      return {
          restrict:'E',
          template: '<div style=\'white-space:pre;\' btf-markdown=\'user.bio\'></div> \
                     <textarea ng-show=\'edittingBio\' ng-model=\'user.bio\' ></textarea>'
      };
  })
  .directive('github', function(){
    return {
      restrict:'E',
      template: '<div style=\'white-space:pre;\'></div> \
                 <textarea ng-show=\'edittingGithub\' ng-model=\'user.githubProfile\' ></textarea>'
    }
  });
