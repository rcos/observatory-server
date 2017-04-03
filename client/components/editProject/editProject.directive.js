'use strict';

angular.module('observatory3App')
.controller('projectEditController', function($scope, $location, $http, $uibModalInstance, Auth, editProject){
    $scope.project = {active: true, repositories: [""]};
    if (editProject) {
        $scope.project = editProject;
        $scope.editing = true;
    }
    $scope.getInfo = function() {
        $scope.githubError = false;

        if($scope.project.githubUsername && $scope.project.githubProjectName) {
            $scope.project.name = $scope.project.githubProjectName;

            $http({ url: 'https://api.github.com/repos/' + $scope.project.githubUsername + '/' + $scope.project.githubProjectName}).then(
              function(response) {
                if (response.data.homepage){
                  $scope.project.websiteUrl = response.data.homepage;
                }
                else{
                  $scope.project.websiteUrl = response.data.html_url;
                }

                $scope.project.description = response.data.description;

              }, function(){
                $scope.githubError = true;
              });

        }
        else{
          $scope.githubError = true;
        }
    };

    $scope.submit = function(form) {
        $scope.submitted = true;

        if(form.$valid) {
            if ($scope.editing){
                $http.put('/api/projects/' + $scope.project._id, $scope.project).then(function(response){
                  $uibModalInstance.close(response.data);

                },function(err){
                  err = err.data;
                  $scope.errors = {};

                  // Update validity of form fields that match the mongoose errors
                  angular.forEach(err.errors, function(error, field) {
                    form[field].$setValidity('mongoose', false);
                    $scope.errors[field] = error.message;
                  });

                });
              }
            else{
                $scope.project.repositories[0] = 'https://github.com/' + $scope.project.githubUsername + '/' + $scope.project.githubProjectName;
                $http.post('/api/projects', $scope.project)
                .then(function(response){
                  $uibModalInstance.close(response.data);

                },function(err){
                  err = err.data;
                  $scope.errors = {};

                  // Update validity of form fields that match the mongoose errors
                  angular.forEach(err.errors, function(error, field) {
                    form[field].$setValidity('mongoose', false);
                    $scope.errors[field] = error.message;
                  });

                });

            }

        }
    };

    $scope.close = function() {
      $uibModalInstance.dismiss('cancel');
    };

});
