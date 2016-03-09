'use strict';

angular.module('observatory3App')
.controller('ProjectsCtrl', function ($scope, $location, $http, Auth, focus) {
    $scope.projects = [];
    $scope.projectToAdd = {active: true, repositories: [""]};
    $scope.loggedIn = false;
    focus('searchProjectsInput');

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

    $scope.addRepository = function() {
        $scope.projectToAdd.repositories[$scope.projectToAdd.repositories.length] = "";
    }

    $scope.removeRepository = function(index) {
        $scope.projectToAdd.repositories.splice(index, 1);
    }

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
