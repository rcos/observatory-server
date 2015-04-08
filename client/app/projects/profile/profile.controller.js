'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, Auth, $stateParams) {
  $scope.isAuthor = false;
  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;
  $scope.getCurrentUser = Auth.getCurrentUser();

  $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
    $scope.project = project;

    if ($scope.isLoggedIn()){
      for(var i = 0 ; i < $scope.project.authors.length ; i++){
        if($scope.project.authors[i]._id == $scope.getCurrentUser._id){
          $scope.isAuthor = true;
        }
      }
    }
  });
});
