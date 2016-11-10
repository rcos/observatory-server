'use strict';

angular.module('observatory3App')
.controller('addAttendanceController', function($scope, $location, $http, $uibModalInstance, Auth, user, notify){
  $scope.user = user;
  $scope.attend = {date:"",type:""};
  $scope.submitted = false;
  $scope.formDateEmptyError = false;
  $scope.formTypeEmptyError = false;

  $scope.autofill = function() {
    //autofill the probable attendance type
    if($scope.attend.date.getDay() == 2) {//Tuesday
        $scope.attend.type = "Small Group";
    } else if($scope.attend.date.getDay() == 5) {//Friday
        $scope.attend.type = "Regular";
    } else {//Some other day
        $scope.attend.type = "Bonus Day";
    }
    $scope.formDateEmptyError = false;
    $scope.formTypeEmptyError = false;
  }

  $scope.typeChanged = function() {
    $scope.formTypeEmptyError = !$scope.attend.type;
  }

  $scope.submit = function(form) {
    if($scope.submitted) {
      return;
    }
    if(!form.$valid) {
      $scope.formDateEmptyError = !$scope.attend.date;
      $scope.formTypeEmptyError = !$scope.attend.type;
      return;
    }
    $scope.formDateEmptyError = false;
    $scope.formTypeEmptyError = false;
    $scope.submitted = true;

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
      $scope.submitted = false;
    });
  };
  $scope.close = function(){
    $uibModalInstance.dismiss('cancel');
  };
});
