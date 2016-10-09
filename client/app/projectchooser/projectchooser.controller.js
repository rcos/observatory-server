'use strict';

angular.module('observatory3App')
  .controller('ProjectChooserCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify, Project) {
    $scope.defaultProjects = [];
    $scope.isLoggedIn = Auth.isLoggedIn;

    $scope.getDefaultProjects = function() {
        $http.get('/api/projects/defaults').success(function(projects) {
            $scope.defaultProjects = projects;
            console.log($scope.defaultProjects[0].photos);
            updateProjects();
        });
    };

    $scope.getDefaultProjects();

    var updateProjects = function(){
        Auth.isLoggedInAsync(function(loggedIn){
            if (loggedIn){
                var user = Auth.getCurrentUser();
                $scope.user = user;
            }
        });
    };

    $scope.checkUserProject = function(project) {
        return $scope.user.projects.indexOf(project._id) !== -1;
    };

    $scope.joinProject = function(project){
        $http.put('/api/users/' + $scope.user._id + '/project',{
            'project': project._id
        }).success(function(){
            notify({ message: "You are now on this project!"  });
            $scope.user.projects.push(project._id);
        }).error(function(){
            notify({message: 'Error adding user to project!', classes: ["alert-danger"]});
        });
    };

    $scope.leaveProject = function(project){
        var loggedInUser = Auth.getCurrentUser();
        $http.delete('/api/users/' + $scope.user._id + '/project',
        {
            'project': project._id
        }).success(function(){
            notify({message: "You are now off this project!", classes: []});
            $scope.user.projects.splice($scope.user.projects.indexOf(project._id), 1);
        }).error(function(){
            notify({message: 'Error removing user from project!', classes: ["alert-danger"]});
        });
    };

    $scope.getImagePrefix = function(project) {
        return '/uploads/';
    };

  });
