
'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, Auth, $http) {
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

    $scope.getInfo = function() {
        if($scope.projectToAdd.repositoryUrl) {
            var splitUrl = $scope.projectToAdd.repositoryUrl.split("/");
            $scope.projectToAdd.githubUsername = splitUrl[splitUrl.length - 2];
            $scope.projectToAdd.githubProjectName = $scope.projectToAdd.name = splitUrl[splitUrl.length - 1];
            $http.get('https://api.github.com/repos/' + $scope.projectToAdd.githubUsername + "/" + $scope.projectToAdd.githubProjectName,{headers: {'content-type': 'application/json'}, Authorization: {"Authorization" : null}})
            .success(function(data, status, headers, config) {
                $scope.projectToAdd.websiteURL = data.homepage;
                $scope.projectToAdd.description = data.description;


            })
            .error(function(data, status, headers, config){
                console.log("Bad URL!");

                // github.repositoryUrl.$setValidity("valid", false);
            });
        }
    }

    $scope.submit = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            $('#addProject').modal('hide');
            // use setTimeout because hiding the modal takes longer than the post request
            // and results in the modal disappearing but the overlay staying if not used
            setTimeout(function() {
                $scope.submitted = false;
                $scope.projectToAdd.authors = [$scope.currentUser._id];
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
                }).error(function(){
                  alert("Could not add project!");

                });

                $scope.projectToAdd = {active: true};

            }, 200);
        }
    };

    $scope.getCurrentProjects(); // update the webpage when connecting the controller
});
