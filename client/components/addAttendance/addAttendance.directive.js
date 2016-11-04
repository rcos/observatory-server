'use strict';

angular.module('observatory3App')
.controller('addAttendanceController', function($scope, $location, $http, $uibModalInstance, Auth, user, notify){
  $scope.user = user;
  $scope.attend = {date:"",type:"",code:""};
  $scope.dateSelected = false; //whether a date has been selected yet

  $scope.autofill = function() {
    //autofill the probable attendance type
    if($scope.attend.date.getDay() == 2) {//Tuesday
        $scope.attend.type = "Small Group";
    } else if($scope.attend.date.getDay() == 5) {//Friday
        $scope.attend.type = "Regular";
    } else {//Some other day
        $scope.attend.type = "Bonus Day";
    }
    //get the attendance code for the selected day and autofill it
    $http.get('/api/attendance/code/'+$scope.attend.date.toISOString())
    .success(function(attendance){
      if(attendance && attendance.length > 0) {
        $scope.attend.code = attendance[0].code;
      } else {
        $scope.attend.code = "";
      }
    }).error(function(){
      $scope.attend.code = "";
    });
    //this enables allow manual date entry
    //in case we don't find the correct code or its wrong nd if the type is wrong
    $scope.dateSelected = true;
  }

  $scope.submit = function(form) {
    if(!form.$valid) {
      notify("Please fill out all fields before submitting, if any fields are disabled select a date first");
      return;
    }
    var params = {};
    params.date = $scope.attend.date;
    params.code = $scope.attend.code;
    params.smallgroup = $scope.attend.type == "Small Group";
    params.bonusday = $scope.attend.type == "Bonus Day";
    
    $http.post('/api/attendance/attend/'+user._id+"/manual", params)
    .then(function(response){
      $uibModalInstance.close();
      notify("Added attendance entry");
    },function(err){
      notify("There was an error with adding the attendance entry");
    });
  };
  $scope.close = function(){
    $uibModalInstance.dismiss('cancel');
  };
});
