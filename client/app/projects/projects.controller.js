'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, $location, $http, $uibModal, Auth, $stateParams, notify, User, Project) {
    $scope.projects = [];
    $scope.projectToAdd = {active: true, repositories: ['']};
    $scope.loggedIn = Auth.isLoggedIn;
    $scope.sortOrder = 'name';
    $scope.favoriteProjects = [];
    $scope.isAdmin = Auth.isAdmin;

    Auth.isLoggedInAsync(function(loggedIn){
        if (loggedIn){
            $scope.user = Auth.getCurrentUser();

            User.favoriteProjects({id:$scope.user._id},function(projects){
                $scope.favoriteProjects = projects;
            });

            Project.getMyProjects().success(function(projects){
              $scope.myProjects = projects;
            });

            if (Auth.isMentor()){
              Project.getMenteesProjects().success(function(projects){
                $scope.menteeProjects = projects;
              });
            }
        }
    });

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
            notify('Project marked as past project');
        }).error(function(){
            notify({ message: 'Error trying to mark as a past project', classes: ['alert-danger'] });
        });
    };

    $scope.markActive =  function(id){
        $http.put('api/projects/'+id+'/markActive').success(function(){
            $scope.getPastProjects();
            notify('Project marked as a current project');
        }).error(function(){
            notify({ message: 'Error trying to mark as current project', classes: ['alert-danger'] });
        });
    };

    $scope.markFavorite = function(project) {
        $http.put('api/users/' + $scope.user._id + '/favorite/'+project._id
        ).success(function(){
            $scope.favoriteProjects.push(project);
            notify("Project added as a favorite");
        }).error(function(){
            notify({ message: 'Error trying to mark as a favorite project', classes: ['alert-danger'] });
        });
    }

    $scope.markNotFavorite = function(project) {
        $http.delete('api/users/' + $scope.user._id + '/favorite/'+project._id
        ).success(function(){
            for(var index = 0; index < $scope.favoriteProjects.length; index++) {
                if($scope.favoriteProjects[index]._id == project._id) {
                  $scope.favoriteProjects.splice(index, 1);
                  break;
                }
            }
            notify("Project removed from favorites");
        }).error(function(){
            notify({ message: 'Error trying to unmark as a favorite project', classes: ['alert-danger'] });
        });
    }

    $scope.isFavorite = function(project) {
        for (var index = 0; index < $scope.favoriteProjects.length; index++) {
            if ($scope.favoriteProjects[index]._id == project._id) {
              return true;
            }
        }
        return false;
    }

    if ($stateParams.state === 'past') {
      $scope.past = true;
      $scope.getPastProjects();
    } else {
      $scope.past = false;
      $scope.getCurrentProjects();
    }
});
