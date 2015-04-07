'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, Auth, $http,  $location) {
    $scope.projects = [];
    $scope.projectToAdd = {active: true};
    $scope.currentUser = Auth.getCurrentUser();

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

    $scope.submit = function(form) {
        // // use setTimeout because hiding the modal takes longer than the post request
        // // and results in the modal disappearing but the overlay staying if not used
        // setTimeout(function() {
            $scope.projectToAdd.repositoryUrl = 'https://github.com/' + $scope.projectToAdd.githubUsername + '/' + $scope.projectToAdd.githubProjectName;
            $scope.projectToAdd.authors = [$scope.currentUser._id];
            console.log([$scope.currentUser._id]);
            $http.post('/api/projects', $scope.projectToAdd).success(function(){
              $('#addProject').modal('hide');
              if(form) {
                  form.$setPristine();
                  form.$setUntouched();
              }
              if ($scope.past){
                $scope.getPastProjects();
              }
              else{
                $scope.getCurrentProjects();
              }
            }).then(function() {
              // Account created, redirect to project
              $location.path('/projects/'+$scope.projectToAdd.githubUsername+ '/' + $scope.projectToAdd.githubProjectName+'/profile');
            }).error(function(){
              alert("Could not add project!");

            });

            $scope.projectToAdd = {active: true};

        // }, 200);
    };

    $scope.getCurrentProjects(); // update the webpage when connecting the controller
});
