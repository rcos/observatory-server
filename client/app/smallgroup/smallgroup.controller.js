'use strict';

angular.module('observatory3App')
.controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify, $filter) {
  $scope.allUsers = User.query();
  $scope.showAttendanceCode = false;
  $scope.isMentor = Auth.isMentor;
  $scope.dayCode = false;
  $scope.loaded = false;

var getAttendees = function(dayCode){
    $http.get('/api/attendance/code/attendees/'+dayCode)
    .success(function (data){
      $scope.numOfattendends.set(dayCode, data);
    }).error(function(err){
      console.log(err);
    });
  }

  var updateSmallGroup = function (callback) {
    callback = callback || function () {};
    return User.smallgroup({id:$scope.user._id})
    .$promise.then(function(smallgroup){
      $scope.smallgroup = smallgroup;
      $scope.numOfattendends = new Map();
      for(var i =0; i<smallgroup.dayCodes.length;i++){
        if(smallgroup.dayCodes[i]){
          getAttendees(smallgroup.dayCodes[i].code);
        }
      }
      $scope.loaded = true;
      if (!$scope.smallgroup._id) {
        $scope.smallgroup = false;
        return false;
      }
      if ('dayCode' in smallgroup && smallgroup.dayCode) {
        $scope.dayCode = smallgroup.dayCode;
      }
      return $http.get('/api/smallgroup/' + $scope.smallgroup._id + '/members').success(function (members) {
        $scope.leaders = [];
        $scope.members = [];
        members.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
            return 1;
          } else {
            return 0;
          }
        });
        for (var person = 0; person < members.length; person++)
        {
          if (members[person].role === 'admin' || members[person].role === 'mentor')
          {
            $scope.leaders.push(members[person]);
          } else
          {
            $scope.members.push(members[person]);
          }
        }
        callback(smallgroup);
      });
    });
  };

  $scope.createSmallGroup = function () {
    $http.post('/api/smallgroup/').success(function () {
      window.location.reload();
      notify('Success!');
    });
  };

  $scope.addUser = function (user) {
      if (!user) {
        return notify({message: 'User not found!', classes: ['alert-danger']});
      }
      // Reload small group (in case other mentors have modified it since page load)
      updateSmallGroup(function (smallgroup) {
        // Check if user is already in small group
        if (smallgroup.students.indexOf(user._id) !== -1) {
          // User is already in group
          return notify('User already in group');
        } else {
          $http.put('/api/smallgroup/' + $scope.smallgroup._id + '/member', {
            'memberId': user._id
          }).success(function () {
            notify('Successfully added ' + user.name);
            updateSmallGroup();
          });
        }
    });
  };

  $scope.edittingSmallGroupName = false;
  $scope.editSmallGroupName = function () {
    $scope.edittingSmallGroupName = !$scope.edittingSmallGroupName;
  };

  $scope.saveSmallGroupName = function () {
    $scope.edittingSmallGroupName = false;
    $http.put("/api/smallgroup/" + $scope.smallgroup._id + "/name", {
      'smallGroupName': $scope.smallgroup.name
    }).success(function () {
      notify('Small Group Name updated!');
    }).error(function () {
      notify('Could not update small group name!', {classes: ["alert-danger"]});
    });
  };

  $scope.generateAttendanceCode = function () {
    if ($scope.dayCode) {
      $scope.showAttendanceCode = true;
    } else {
      $http.post('/api/smallgroup/' + $scope.smallgroup._id + '/daycode')
      .success(function (code) {
        $scope.dayCode = code;
        submitDayCode(code);
        $scope.showAttendanceCode = true;
        updateSmallGroup();
      });
    }
  };

  var submitDayCode = function(code){
      $http.post('/api/attendance/attend', {
        dayCode: code
      }).success(function(){
        updateSmallGroup();
        }).error(function(err){
        notify({ message: 'Error: ' + err, classes: ['alert-danger'] });
      });
    };

  $scope.isPresent = function () {
    return false;
  };

  $scope.deleteDay = function(day) {
    var dateString = $filter('date')(day.date, 'MMM dd');
    $http.delete('/api/smallgroup/' + $scope.smallgroup._id + '/day/' + day.code)
      .success(function(smallgroup){
        notify('Successfully removed day: ' + dateString);
        $scope.smallgroup = smallgroup;
        updateSmallGroup();
      })
    .error(function() {
      notify('ERROR: Could not remove day: ' + dateString);
    });
  };

  $scope.removeUser = function (student) {
    $http.delete('/api/smallgroup/' + $scope.smallgroup._id + '/member/' + student._id).success(function () {
      notify('Successfully removed ' + student.name);
      if (student._id === $scope.user._id) {
        notify('You have been removed from ' + $scope.smallgroup.name);
        $scope.smallgroup = false;
      }
      updateSmallGroup();
    }).error(function () {
      notify('ERROR: Could not remove ' + student.name);
    });

  };

  Auth.getCurrentUser(function (user) {
    $scope.user = user;
    updateSmallGroup();
  });

})
.directive('hname', function () {
  return {
    restrict: 'E',
  };
});
