'use strict';

angular.module('observatory3App')
  .controller('MentorCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    function updateUnverified(){
        $http.get("/api/users/unverified")
        	.success(function(unverifiedUsers){
        		$scope.unverifiedUsers = unverifiedUsers;
        	})
        	.error(function(err){
            notify({ message: "Error Occurred: " + err, classes: ["alert-danger"] });
        	});
    }
    $scope.verifyAttendance = function(user){
    	$http.put("/api/users/" + user._id + "/verifyAttendance")
            .success(function(){
                updateUnverified();
            })
            .error(function(err){
                notify({ message: "Error Occurred: " + err, classes: ["alert-danger"] });
            });
    };
    updateUnverified();
  });
