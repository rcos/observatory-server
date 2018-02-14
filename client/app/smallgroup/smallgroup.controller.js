'use strict';

angular.module('observatory3App')
.controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, Smallgroup, $location, notify) {
  $scope.allUsers = User.query();
  $scope.isMentor = Auth.isMentor;

  var loadSmallGroup = function (callback) {
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
      loadSmallGroup(function (smallgroup) {
        // Check if user is already in small group
        if (smallgroup.students.indexOf(user._id) !== -1) {
          // User is already in group
          return notify('User already in group');
        } else {
          Smallgroup.addMember({
              _id: $scope.smallgroup._id,
              memberId: user._id
          }, function() {
            notify('Successfully added ' + user.name);
            loadSmallGroup();
          }, function() {
            notify('Could not add user to small group!', {classes: ['alert-danger']});
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
    Smallgroup.setName({
      '_id': $scope.smallgroup._id,
      'smallGroupName': $scope.smallgroup.name
    }, function () {
      notify('Small Group Name updated!');
    }, function () {
      notify('Could not update small group name!', {classes: ['alert-danger']});
    });
  };

  $scope.removeUser = function (student) {
    Smallgroup.removeMember({
      smallgroupId: $scope.smallgroup._id,
      id: student._id
    }, function() {
      notify('Successfully removed ' + student.name);
      if (student._id === $scope.user._id) {
        notify('You have been removed from ' + $scope.smallgroup.name);
        $scope.smallgroup = false;
      }
      loadSmallGroup();
    }, function () {
      notify('ERROR: Could not remove ' + student.name);
    });
  };

  $scope.removeSelf = function(){
    $scope.removeUser($scope.user);
  };

  Auth.getCurrentUser(function (user) {
    $scope.user = user;
    loadSmallGroup();
  });
})
.directive('hname', function () {
  return {
    restrict: 'E',
  };
});
