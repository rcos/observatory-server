'use strict';

angular.module('observatory3App')
  .controller('SmallGroupCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    $scope.showAttendanceCodeFull = false;
    $scope.isMentor = Auth.isMentor;

    Auth.getCurrentUser(function(user){
        $scope.user = user;
        updateSmallGroup();
    });

    function updateSmallGroup(callback){
        callback = callback || function(){};
        $http.get('/api/smallgroup/' + $scope.user.smallgroup).success(function(smallgroup){
            $scope.smallgroup = smallgroup;
            if ('daycode' in smallgroup && smallgroup.daycode){
                    $scope.showAttendanceCode = true;
            }
            else{
                    $scope.showAttendanceCode = false;
            }
            $http.get('/api/smallgroup/' + $scope.user.smallgroup + '/members').success(function(members){
                $scope.members = members;
                callback(smallgroup);
            });
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
            updateSmallGroup(function(smallgroup){
                // Check if user is already in small group
                if (smallgroup.students.indexOf(user._id) !== -1){
                    // User is already in group
                    return notify("User already in group");
                }else{
                    $http.put("/api/smallgroup/" + $scope.smallgroup._id + "/member", {
                        "memberId": user._id
                    }).success(function(){
                        notify("Successfully added " + user.name);
                        updateSmallGroup();
                    });
                }
            })
        });
    };
    $scope.generateAttendanceCode = function(){
      if ($scope.showAttendanceCode){ //TODO call api to generate code
        $scope.showAttendanceCodeFull=true;
      }
      else {
        $scope.showAttendanceCode = true;
      }
    };

    $scope.isPresent = function(){ return false; };
  });
