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

            // Check if there is already an attendance code
            var today = new Date();
            today.setHours(0,0,0,0);
            delete $scope.attendanceCode;
            for (var i = 0; i < currentClass.dayCodes.length;i++){
                if (new Date(currentClass.dayCodes[i].date).getTime() === today.getTime()){
                    $scope.attendanceCode = currentClass.dayCodes[i].code;
                }
            }
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
            semester = 'Spring';
        }
        else if (today.getMonth() < 8){
            semester = 'Summer';
        }
        else{
            semester = 'Fall';
        }
        return {year: today.getFullYear(), semester: semester};
    };

    $scope.createNewSemester = function(form){
        $scope.submitted = true;
        var thisSemester = $scope.newSemester.semester + ' ' + String($scope.newSemester.year);
        $scope.submitted = true;

        if(form.$valid) {
            $http.post('/api/classyear/', {
                semester: thisSemester
            }).success(function(){
                updateClassYear();
                $scope.newSemester = getSemesterToday();
                $scope.showNewSemester = false;
                $scope.submitted = false;

            })
            .error(function(err){
                console.error('Error creating new semester', err);
            });
        }
    };

    $scope.semesterOptions = ["Spring" , "Summer", "Fall"];
    $scope.newSemester = getSemesterToday();
    updateClassYear();

});
