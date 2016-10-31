'use strict';

angular.module('observatory3App')
.controller('AdminAttendanceCtrl', function ($scope, $http, Auth, User, $location, $window, notify) {
    $scope.showDayCode = false;
    $scope.showBonusDayCode = false;
    $scope.dayCode = false;
    $scope.bonusDayCode = false;
    $scope.loaded = false;
    $scope.numOfattendees = new Map();

    if (Auth.isLoggedIn()){
        var loggedInUser = Auth.getCurrentUser();

        if(loggedInUser.role!=='admin'){
            $location.path('/');
        }
    }
    else{
        $location.path('/');
    }

    var getAttendees = function(dayCode){
      $http.get('/api/attendance/code/attendees/'+dayCode)
      .success(function (data){
        //store a list of attendees
        $scope.numOfattendees.set(dayCode, data.length);
      }).error(function(err){
        console.log(err);
      });
    };

    var updateClassYear = function(){
        $http.get('/api/classyear')
        .success(function(currentClass){
=            // Check if there is already an attendance code
            var today = new Date();
            today.setHours(0,0,0,0);
            if ('dayCode' in currentClass && currentClass.dayCode) {
              $scope.dayCode = currentClass.dayCode;
            }
            if ('bonusDayCode' in currentClass && currentClass.bonusDayCode) {
              $scope.bonusDayCode = currentClass.bonusDayCode;
            }

            $scope.currentClass = currentClass;
            $scope.displayURP = currentClass.displayURP;

            if ('dayCodes' in currentClass && currentClass.dayCodes){
              $scope.numOfattendees = new Map();
              for(var i =0; i<currentClass.dayCodes.length;i++){
                if(currentClass.dayCodes[i]){
                  getAttendees(currentClass.dayCodes[i].code);
                }
              }
            }

        }).error(function(err){
            console.error('Error getting class year', err);
        });
    };

    var submitDayCode = function(code){
      $http.post('/api/attendance/attend', {
        dayCode: code
      }).success(function(){
      }).error(function(err){
        notify({ message: 'Error: ' + err, classes: ['alert-danger'] });
      });
    };


    $scope.generateDayCode = function(bonusDay){
        $http.post('/api/classyear/daycode', {
            bonusDay: bonusDay ? true : false
        }).success(function(code){
          submitDayCode(code);
          if (bonusDay){
            $scope.bonusDayCode = code;
            $scope.showBonusDayCode = true;
          }
          else{
            $scope.dayCode = code;
            $scope.showDayCode = true;
          }
          updateClassYear();
        });
    };

    updateClassYear();

});
