'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, $location, $http, $uibModal, Auth, $stateParams,notify) {
    $scope.projects = [];
    $scope.projectToAdd = {active: true, repositories: [""]};
    $scope.loggedIn = false;
    $scope.sortOrder = 'name';

    Auth.isLoggedInAsync(function(loggedIn){
        if (loggedIn){
            var user = Auth.getCurrentUser();
            $scope.user = user;
        }
    });
    $scope.isAdmin = Auth.isAdmin;

    $scope.toggleSortOrder = function(){
      if($scope.sortOrder === '-name'){
        $scope.sortOrder = 'name';
      }else if($scope.sortOrder === 'name'){
        $scope.sortOrder = '-name';
      }
    };

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

    $scope.markPast = function(id){
        $http.put('api/projects/'+id+'/markPast').success(function(){
            $scope.getCurrentProjects();
            notify("Project marked as past project");
        }).error(function(){
            notify({ message: 'Error trying to mark as a past project', classes: ['alert-danger'] });
        });
    };

    $scope.markActive =  function(id){
        $http.put('api/projects/'+id+'/markActive').success(function(){
            $scope.getPastProjects();
            notify("Project marked as a current project");
        }).error(function(){
            notify({ message: 'Error trying to mark as current project', classes: ['alert-danger'] });
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
