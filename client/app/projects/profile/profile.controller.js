/*jshint multistr: true */
'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, Auth, $stateParams, $upload, Project) {
    $scope.userOnProject = false;

    function updateProject(){
        Project.getProject($stateParams.username, $stateParams.project).then(function(result) {
            $scope.project = result.data;
            getAuthors();
            Auth.isLoggedInAsync(function(loggedIn){
                if (loggedIn){
                    var user = Auth.getCurrentUser();
                    $scope.user = user;
                    $scope.checkUserProject();
                }
            });
        });
    }

    updateProject();


    var getAuthors = function() {
        var project = $scope.project;
        $http.get('/api/projects/' + project._id + '/authors')
            .success(function(authors){
                $scope.authors = authors;})
    }

    $scope.imgPrefix = '/uploads/' + $stateParams.username + '/' + $stateParams.project + '/';


    $scope.edittingDesc = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;

    $scope.editDesc = function(){
        $scope.edittingDesc = !$scope.edittingDesc;
    };

    $scope.saveDesc = function(){
        $scope.edittingDesc = false;
        $http.put('/api/projects/' + $scope.project._id, {
            'description': $scope.project.description
        }).success(function(){
            window.alert('Description updated!');
        }).error(function(){
            window.alert('Could not update description!');
        });
    };

    $scope.joinProject = function(){
        $http.put("/api/users/" + $scope.user._id + "/project",{
            "project": $scope.project._id
        }).success(function(){
            window.alert("You are now on this project!");
            $scope.userOnProject = true;
            $scope.user.projects.push($scope.project._id);
            getAuthors();
        }).error(function(){
            window.alert("Error adding user to project!");
        });
    };

    $scope.leaveProject = function(){
        var loggedInUser = Auth.getCurrentUser();
        $http.delete("/api/users/" + loggedInUser._id + "/project",{
            "project": $scope.project._id
        }).success(function(){
            window.alert("You are now off this project!");
            $scope.user.projects.splice($scope.user.projects.indexOf($scope.project._id), 1);
            $scope.userOnProject = false;
            getAuthors();
        }).error(function(){
            window.alert("Error removing user from project!");
        });
    };


    $scope.isDefault = function(){
        return $scope.project.markedDefault;
    };

    

    $scope.markDefault = function(){
        $http.put('api/projects/'+$scope.project._id+'/markdefault').success(function(){
            window.alert("Project marked as default");
            updateProject();
        }).error(function(){
            window.alert("Could not mark project as default!");
        });
    };

    $scope.unmarkDefault = function(){
        $http.put('api/projects/'+$scope.project._id+'/unmarkdefault').success(function(){
            window.alert("Project unmarked as default");
            updateProject();
        }).error(function(){
            window.alert("Could not unmark project as default!");
        });
    };

    $scope.checkUserProject = function() {
        $scope.userOnProject = $scope.user.projects.indexOf($scope.project._id) !== -1;
    };

    $scope.onFileSelect = function($files) {
        //$files: an array of files selected, each file has name, size, and type.
        for (var i = 0; i < $files.length; i++) {
            var $file = $files[i];
            $upload.upload({
                url: 'api/projects/'+$stateParams.username+'/'+$stateParams.project+'/upload',
                file: $file
            });
        }
        $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
            $scope.project = project;
        });
    };
})
.directive('desc', function() {
    return {
        restrict:'E',
        template: '<div btf-markdown=\'project.description\'></div> \
            <textarea ng-show=\'edittingDesc && userOnProject\' ng-model=\'project.description\' ></textarea>'
    };
});
