'use strict';

angular.module('observatory3App')
.directive('viewAttendance', function () {
  return {
    templateUrl: 'components/viewAttendance/viewAttendance.html',
    scope: {
      endpoint: '@',
      names: '=',
      hide: '='
    },
    restrict: 'E',
    controller: function ($scope, $http, User, Smallgroup, $window, notify, $filter) {
      $scope.showDayCode = false;
      $scope.showBonusDayCode = false;
      $scope.hide = false;
      $scope.dayCode = false;
      $scope.bonusDayCode = false;
      $scope.numOfattendees = new Map();
      $scope.namesOfattendees = new Map();

      var getAttendees = function(dayCode){
        if(dayCode){
          $http.get('/api/attendance/code/attendees/'+dayCode)
            .success(function (data){
              //store a list of attendees
              $scope.numOfattendees.set(dayCode, data.length);
              if ($scope.names){
                var names = [];
                for(var j = 0; j < data.length; j++){
                  names[j] =data[j].name;
                }
                $scope.namesOfattendees.set(dayCode, names);
              }
            }).error(function(err){
              console.log(err);
            });
        }
      };

      var saveGroupData = function(group){
        $scope.group = group;
        if (!$scope.group._id) {
          $scope.group = false;
          return false;
        }
        $scope.dayCode = false;
        $scope.bonusDayCode = false;
        // Check if there is already an attendance code
        if ('dayCode' in group && group.dayCode) {
          $scope.dayCode = group.dayCode;
        }
        if ('bonusDayCode' in group && group.bonusDayCode) {
          $scope.bonusDayCode = group.bonusDayCode;
        }

        if ('dayCodes' in group && group.dayCodes){
          $scope.numOfattendees = new Map();
          if ($scope.names){
            $scope.namesOfattendees = new Map();
          }
          for(var i =0; i<group.dayCodes.length;i++){
            if(group.dayCodes[i]){
              getAttendees(group.dayCodes[i].code);
            }
          }
        }
      };

      var updateGroup = function(){
        if ($scope.endpoint === 'smallgroup'){
          return User.smallgroup()
          .$promise.then(saveGroupData);
        }
        else{
          return $http.get('/api/'+$scope.endpoint)
          .success(saveGroupData).error(function(err){
            console.error('Error getting '+ $scope.endpoint, err);
          });
        }
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
        if ($scope.endpoint === 'smallgroup') {
          Smallgroup.createDaycode({
            '_id': $scope.group._id,
            'bonusDay': bonusDay ? true : false
          }, function (data) {
            submitDayCode(data.code);
            if (bonusDay){
              $scope.bonusDayCode = data.code;
              $scope.showBonusDayCode = true;
            }
            else{
              $scope.dayCode = data.code;
              $scope.showDayCode = true;
            }
            $scope.hide = true;
            updateGroup();
          });
        } else {
          $http.post('/api/'+$scope.endpoint+'/daycode', {
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
            $scope.hide = true;
            updateGroup();
          });
        }
      };

      $scope.deleteDay = function(day) {
        var dateString = $filter('date')(day.date, 'MMM dd');

        var deleteDaySuccess = function(group) {
          notify('Successfully removed day: ' + dateString);
          $scope.group = group;
          updateGroup();
        };

        var deleteDayError = function() {
          notify('ERROR: Could not remove day: ' + dateString);
        };

        if ($scope.endpoint === 'smallgroup') {
          Smallgroup.deleteDaycode({
            smallgroupId: $scope.group._id,
            id: day.code
          },
          deleteDaySuccess,
          deleteDayError);
        } else {
          $http.delete('/api/'+$scope.endpoint+'/day/' + day.code)
            .success(deleteDaySuccess)
            .error(deleteDayError);
        }
      };

      updateGroup();
    }
  };
});
