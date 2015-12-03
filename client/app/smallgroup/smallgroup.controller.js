'use strict';

angular.module('observatory3App')
  .controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    Auth.getCurrentUser(function(user){
        $scope.user = user;
        loadSmallGroup();
    });

    function loadSmallGroup(callback){
        callback = callback || function(){};
        $http.get('/api/smallgroup/' + $scope.user.smallgroup).success(function(smallgroup){
            $scope.smallgroup = smallgroup;
            callback(smallgroup);
        });
        $http.get('/api/smallgroup/' + $scope.user.smallgroup + '/members').success(function(members){
            $scope.members = members;
        });
    }

    $scope.createSmallGroup = function(){
        $http.post("/api/smallgroup/").success(function(){
            window.location.reload();
            notify("Success!");
        });
    };
    $scope.addUser = function(user){
        $http.get("/api/users/search", {
            params: {
                query: user,
                single: true
            }
        }).success(function(user){
            if (!user) return notify({message: 'User not found!', classes: ["alert-danger"]});

            // Reload small group (in case other mentors have modified it since page load)
            loadSmallGroup(function(smallgroup){
                // Check if user is already in small group
                if (smallgroup.students.indexOf(user._id) !== -1){
                    // User is already in group
                    return notify("User already in group");
                }else{
                    $http.put("/api/smallgroup/" + $scope.smallgroup._id + "/member", {
                        "memberId": user._id
                    }).success(function(){
                        notify("Successfully added " + user.name);
                        loadSmallGroup();
                    });
                }
            })
        });
    };
    $scope.showAttendance = function(){
      if ($scope.showAttendanceCode){
        $scope.showAttendanceCodeFull=true;
      }
      else {
        $scope.showAttendanceCode = true;
        $scope.showAttendanceCodeText = "Show Attendance";
      }
    };

    $scope.showAttendanceCode = false;
    $scope.showAttendanceCodeFull = false;
    $scope.showAttendanceCodeText="Generate Attendance";
    $scope.isPresent = function(){ return false; };
    $scope.isMentor = Auth.isMentor;
  });
