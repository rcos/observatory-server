'use strict';

angular.module('observatory3App')
.controller('addAttendanceController', function($scope, $location, $http, $uibModalInstance, $uibModal,Auth, user, notify){
  $scope.user = user;
  $scope.attend = {date:'',type:''};
  var attended = {};
  $scope.submitted = false;
  $scope.formDateEmptyError = false;
  $scope.formTypeEmptyError = false;
  $scope.calendarOptions = {
    customClass: getAttendanceStatus,
    showWeeks: false
  };

  $scope.autofill = function() {
    //autofill the probable attendance type
    if($scope.attend.date.getDay() === 2) {//Tuesday
        $scope.attend.type = 'Small Group';
    } else if($scope.attend.date.getDay() === 5) {//Friday
        $scope.attend.type = 'Regular';
    } else {//Some other day
        $scope.attend.type = 'Bonus Day';
    }
    $scope.formDateEmptyError = false;
    $scope.formTypeEmptyError = false;
  };

  $scope.typeChanged = function() {
    $scope.formTypeEmptyError = !$scope.attend.type;
  };

  function getAttendanceStatus(data) {
    var date = data.date,
    mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for(var i = 0; i< $scope.user.attendance.length;i++){
        var currentDay = new Date($scope.user.attendance[i].date).setHours(0,0,0,0);
        var isVerified = $scope.user.attendance[i].verified;
        if(dayToCheck ===currentDay){
          if(isVerified){

            if(!attended.hasOwnProperty(currentDay)){
              attended[currentDay] = new Set();
            }
            attended[currentDay].add($scope.user.attendance[i]);

            return 'attended';
          } else {
            return 'unverified';
          }
        }
      }
    }
    return '';
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
    params.smallgroup = $scope.attend.type === 'Small Group' || $scope.attend.type === 'Small Group Bonus Day';
    params.bonusday = $scope.attend.type === 'Bonus Day' || $scope.attend.type === 'Small Group Bonus Day';

    $http.post('/api/attendance/attend/'+user._id+'/manual', params)
      .then(function(){
        $uibModalInstance.close();
        notify('Added attendance entry');
      },function(){
        notify('There was an error with adding the attendance entry');
        $scope.submitted = false;
      });
  };

  $scope.removeOne = function (day) {
    $http.delete('/api/attendance/'+day._id)
    .then(function(){
      $scope.close();
      notify('Attendance removed');
    },function() {
      notify('Attendance cannot be removed');
    });
  };

  $scope.confirmRemove=function(day){
    $scope.msg = {value:'Confirm remove '+user.name +' attendance?' };
    $uibModal.open({
      templateUrl: 'components/confirmDialog/confirmDialog.html',
      controller: 'confirmDialogCtrl',
      size: 'sm',
      resolve : {
        msg : $scope.msg
      }
    }).result.then(function(result){
      $scope.value = result;
      if(result){
        $scope.removeOne(day);
      }
    });
  };

  $scope.attendanceOn= function (date) {
    date = new Date(date).setHours(0,0,0,0);
    if(attended.hasOwnProperty(date)){
      return Array.from(attended[date]);
    }
  };

  $scope.isAttended = function(date){
    date = new Date(date).setHours(0,0,0,0);
    return attended.hasOwnProperty(date);
  };


  $scope.close = function(){
    $uibModalInstance.dismiss('cancel');
  };
});
