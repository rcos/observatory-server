'use strict';

angular.module('observatory3App')
.controller('addAttendanceController', function($scope, $location, $http, $uibModalInstance, Auth, user, notify){
  $scope.user = user;
  $scope.attend = {date:"",type:""};

  $scope.autofill = function() {
    //autofill the probable attendance type
    if($scope.attend.date.getDay() == 2) {//Tuesday
        $scope.attend.type = "Small Group";
    } else if($scope.attend.date.getDay() == 5) {//Friday
        $scope.attend.type = "Regular";
    } else {//Some other day
        $scope.attend.type = "Bonus Day";
    }
  }

  $scope.submit = function(form) {
    if(!form.$valid) {
      notify("Please fill out all fields before submitting, if any fields are disabled select a date first");
      return;
    }
    var params = {};
    params.date = $scope.attend.date;
    params.smallgroup = $scope.attend.type == "Small Group" || $scope.attend.type == "Small Group Bonus Day";
    params.bonusday = $scope.attend.type == "Bonus Day" || $scope.attend.type == "Small Group Bonus Day";

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
