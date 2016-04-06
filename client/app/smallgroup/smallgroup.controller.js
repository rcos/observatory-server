'use strict';

angular.module('observatory3App')
.controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
  $scope.allUsers = User.query();
  $scope.showAttendanceCodeFull = false;
  $scope.isMentor = Auth.isMentor;

  $scope.loaded = false;

  Auth.getCurrentUser(function (user) {
    $scope.user = user;
    updateSmallGroup();
  });

  var updateSmallGroup = function (callback) {
    callback = callback || function () {};

    if (!$scope.user.smallgroup){
      $scope.loaded = true;
      $scope.smallgroup = null;
      return;
    }

    $http.get('/api/smallgroup/' + $scope.user.smallgroup).success(function (smallgroup) {
      $scope.smallgroup = smallgroup;
      $scope.loaded = true;
      if (!smallgroup) {
        $scope.smallgroup = false;
        return false;
      }
      if ('dayCode' in smallgroup && smallgroup.dayCode) {
        $scope.showAttendanceCode = true;
      } else {
        $scope.showAttendanceCode = false;
      }
      $http.get('/api/smallgroup/' + $scope.user.smallgroup + '/members').success(function (members) {
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
    $http.put("/api/smallgroup/" + $scope.user.smallgroup + "/name", {
      'smallGroupName': $scope.smallgroup.name
    }).success(function () {
      notify('Small Group Name updated!');
    }).error(function () {
      notify('Could not update small group name!', {classes: ["alert-danger"]});
    });
  };


  $scope.generateAttendanceCode = function () {
    if ($scope.showAttendanceCode) { //TODO call api to generate code
      $scope.showAttendanceCodeFull = true;
    } else {
      $http.post('/api/smallgroup/' + $scope.smallgroup._id + '/daycode')
              .success(function (code) {
                $scope.smallgroup.dayCode = code;
                $scope.showAttendanceCode = true;
              });
    }
  };

  $scope.isPresent = function () {
    return false;
  };

  $scope.removeUser = function (student) {
    $http.delete('/api/smallgroup/' + $scope.smallgroup._id + '/member/' + student._id).success(function () {
      notify('Successfully removed ' + student.name);
      if (student._id === $scope.user._id) {
        notify('You have been removed from ' + $scope.smallgroup.name);
        $scope.user.smallgroup = false;
        $scope.smallgroup = false;
      }
      updateSmallGroup();
    }).error(function () {
      notify('ERROR: Could not remove ' + student.name);
    });

  };
})
.directive('hname', function () {
  return {
    restrict: 'E',
    //template: '<input type=\'text\' maxlength="50" ng-show=\'edittingSmallGroupName\' ng-model=\'smallgroup.name\'><br>'
  };
});
