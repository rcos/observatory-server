'use strict';

angular.module('observatory3App')

.controller('ProjectsCtrl', function ($scope, $location, $http, Auth) {
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

    $scope.getInfo = function() {
        if($scope.projectToAdd.githubUsername && $scope.projectToAdd.githubProjectName) {
            $scope.projectToAdd.name = $scope.projectToAdd.githubProjectName;
            $.getJSON('https://api.github.com/repos/' + $scope.projectToAdd.githubUsername + '/' + $scope.projectToAdd.githubProjectName, function(response) {
                $scope.projectToAdd.websiteURL = response.homepage;
                $scope.projectToAdd.description = response.description;
                $scope.$apply();
            });
        }
    };

    $scope.addRepository = function() {
        $scope.projectToAdd.repositories[$scope.projectToAdd.repositories.length] = "";
    }

    $scope.removeRepository = function(index) {
        $scope.projectToAdd.repositories.splice(index, 1);
    }

    $scope.submit = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            $scope.submitted = false;
            $scope.projectToAdd.repositories[0] = "https://github.com/" + $scope.projectToAdd.githubUsername + "/" + $scope.projectToAdd.githubProjectName;
            $('#addProject').modal('hide');
            // use setTimeout because hiding the modal takes longer than the post request
            // and results in the modal disappearing but the overlay staying if not used
            setTimeout(function() {
                $http.post('/api/projects', $scope.projectToAdd);

                if ($scope.past){
                    $scope.getPastProjects();
                }
                else{
                    $scope.getCurrentProjects();
                }
                var redirectUsername = $scope.projectToAdd.githubUsername;
                var redirectProjectName = $scope.projectToAdd.githubProjectName;
                $scope.projectToAdd = {active: true};

                $location.path( 'projects/' + redirectUsername + '/' + redirectProjectName + '/profile');
            }, 200);
        }
    };

    $scope.getCurrentProjects(); // update the webpage when connecting the controller
})

.filter('searchFor',function(){
  return function(arr,searchString){
    if(!searchString){
      return arr;
    }
    var result = [];
    searchString = searchString.toLowerCase();
    angular.forEach(arr,function(item){
      if(item.name.toLowerCase().indexOf(searchString) !== -1){
        result.push(item);
      }
      else{
        for(var i=0; i<item.tech.length;i++){
          if(item.tech[i].toLowerCase().indexOf(searchString) !== -1){
            result.push(item);
            break;
          }
        }
      }
    });
    return result;
  };
});
