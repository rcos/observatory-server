'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, $location, $http, $uibModal, Auth, $stateParams) {
    $scope.projects = [];
    $scope.projectToAdd = {active: true, repositories: [""]};
    $scope.loggedIn = false;

    Auth.isLoggedInAsync(function(loggedIn){
        if (loggedIn){
            var user = Auth.getCurrentUser();
            $scope.user = user;
        }
    });

    $scope.getCurrentProjects = function() {
        $http.get('/api/projects').success(function(projects) {
            $scope.projects = projects;
        });
        $scope.past = false;
    };

    $scope.getPastProjects = function() {
        $http.get('/api/projects/past').success(function(projects) {
            $scope.projects = projects;
        });
        $scope.past = true;
    };

    $scope.addProject = function() {
      var modalInstance = $uibModal.open({
        templateUrl: 'components/editProject/editProject.html',
        controller: 'projectEditController',
        backdrop : 'static',

        resolve: {
          editProject: function () {
            return  null;
          },
        }
      });

      modalInstance.result.then(function (projectAdded) {
        // $window.location.reload();
        var redirectUsername = projectAdded.githubUsername;
        var redirectProjectName = projectAdded.githubProjectName;
        $location.path( 'projects/' + redirectUsername + '/' + redirectProjectName + '/profile');

      }, function(){

      });
    };

    $scope.addRepository = function() {
        $scope.projectToAdd.repositories[$scope.projectToAdd.repositories.length] = "";
    }

    $scope.removeRepository = function(index) {
        $scope.projectToAdd.repositories.splice(index, 1);
    }

    if ($stateParams.state === 'past') {
      $scope.past = true;
      $scope.getPastProjects();
    } else {
      $scope.past = false;
      $scope.getCurrentProjects();
    }
});
