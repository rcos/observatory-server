'use strict';

angular.module('observatory3App')
.controller('projectEditController', function($scope, $location, $http, Auth){
    $scope.projectToEdit = {active: true, repositories: [""]};
    if ($scope.project) {
        $scope.projectToEdit = $scope.project;
    }
    $scope.editing=$scope.path!="/projects";

    $scope.getInfo = function() {
        if($scope.projectToEdit.githubUsername && $scope.projectToEdit.githubProjectName) {
            $scope.projectToEdit.name = $scope.projectToEdit.githubProjectName;
            $.getJSON('https://api.github.com/repos/' + $scope.projectToEdit.githubUsername + '/' + $scope.projectToEdit.githubProjectName, function(response) {
                    $scope.projectToEdit.websiteURL = response.homepage;
                    $scope.projectToEdit.description = response.description;
                    $scope.$apply();
                    });
        }
    };

    $scope.submit = function(form) {
console.log($location, Auth, $scope);
        $scope.submitted = true;

        if(form.$valid) {
            $scope.submitted = false;
            $scope.projectToEdit.repositories[0] = "https://github.com/" + $scope.projectToEdit.githubUsername + "/" + $scope.projectToEdit.githubProjectName;

            $('#editProject').modal('hide');
            // use setTimeout because hiding the modal takes longer than the post request
            // and results in the modal disappearing but the overlay staying if not used
            setTimeout(function() {
                var redirectUsername = $scope.projectToEdit.githubUsername;
                var redirectProjectName = $scope.projectToEdit.githubProjectName;
                if ($scope.editing)
                    console.log($http.put('/api/projects/' + $scope.projectToEdit._id, $scope.projectToEdit));
                else
                    $http.post('/api/projects', $scope.projectToEdit);

                if ($scope.past){
                    $scope.getPastProjects();
                }
                else{
                    $scope.getCurrentProjects();
                }
                $scope.projectToEdit = {active: true};

                $location.path( 'projects/' + redirectUsername + '/' + redirectProjectName + '/profile');
            }, 200);
        }
    };
})
.directive('editProject', function() {
    return {
        restrict: "E",
        templateUrl: "components/editProject/editProject.html",
        scope: {
            project: '='
        }
    };
});
