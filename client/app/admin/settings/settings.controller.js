'use strict';

angular.module('observatory3App')
.controller('AdminSettingsCtrl', function ($scope, $http, Auth, User, $location, $window) {

    if (Auth.isLoggedIn()){
        var loggedInUser = Auth.getCurrentUser();

        if(loggedInUser.role!=='admin'){
            $location.path('/');
        }
    }
    else{
        $location.path('/');
    }

    var updateClassYear = function(){
        $http.get('/api/classyear')
        .success(function(currentClass){
            $scope.currentClass = currentClass;
            $scope.displayURP = currentClass.displayURP;

        }).error(function(err){
            console.error('Error getting class year', err);
        });
    };

    // Toggles the display of URP form
    $scope.URPDisplay = function(){
        $scope.displayURP = !$scope.displayURP;
        $http.put('/api/classyear/displayURP', {
            displayURP: $scope.displayURP ? true : false
        }).error(function(err){
            console.error('Error getting class year', err);
        });
        $window.location.reload();

    };

    var getSemesterToday = function(){
        var today = new Date();
        var semester = '';
        if (today.getMonth() < 5){
            semester = 'spring';
        }
        else if (today.getMonth() < 8){
            semester = 'summer';
        }
        else{
            semester = 'fall';
        }
        return {year: String(today.getFullYear()), semester: semester};
    };

    $scope.createNewSemester = function(form){
        $scope.submitted = true;
        var thisSemester = '';
        if ($scope.newSemester.semester !== ''){
            thisSemester += $scope.newSemester.semester;
        }
        else{
            thisSemester += $scope.todaySemester.semester;
        }
        if (thisSemester !== ''){
          thisSemester += ' ';
        }
        if ($scope.newSemester.year !== ''){
            thisSemester += $scope.newSemester.year;
        }
        else{
            thisSemester += $scope.todaySemester.year;
        }
        if(form.$valid) {
            $http.post('/api/classyear/', {
                semester: thisSemester
            }).success(function(){
                updateClassYear();
                $scope.newSemester = {year:'', semester:''};
                $scope.showNewSemester = false;
            })
            .error(function(err){
                console.error('Error creating new semester', err);
            });
        }
    };

    $scope.todaySemester = getSemesterToday();
    $scope.newSemester = {year:'', semester:''};
    updateClassYear();

});
