'use strict';

angular.module('observatory3App')
.controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify, $filter) {
  $scope.allUsers = User.query();
  $scope.isMentor = Auth.isMentor;
  var getAttendees = function(dayCode){
    $http.get('/api/attendance/code/attendees/'+dayCode)
    .success(function (data){
      //store a list of attendees
      $scope.numOfattendees.set(dayCode, data.length);
      var names = [];
      for(var j = 0; j < data.length; j++){
        names[j] =data[j].name;
      }
      $scope.namesOfattendees.set(dayCode, names);
    }).error(function(err){
      console.log(err);
    });
  };

  var updateSmallGroup = function (callback) {
    callback = callback || function () {};
    return User.smallgroup()
    .$promise.then(function(smallgroup){
      $scope.smallgroup = smallgroup;
      if (!$scope.smallgroup._id) {
        $scope.smallgroup = false;
        return false;
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

  $scope.generateDayCode = function (bonusDay) {
    $http.post('/api/smallgroup/' + $scope.smallgroup._id + '/daycode', {
        bonusDay: bonusDay ? true : false
    }).success(function (code) {
      submitDayCode(code);
      if (bonusDay){
        $scope.bonusDayCode = code;
        $scope.showBonusDayCode = true;
      }
      else{
        $scope.dayCode = code;
        $scope.showDayCode = true;
      }
      updateSmallGroup();
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
