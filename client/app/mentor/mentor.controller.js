'use strict';

angular.module('observatory3App')
  .controller('MentorCtrl', function ($scope, $stateParams, $http, Auth, User, $location) {
    function updateUnverified(){
        $http.get("/api/users/unverified")
        	.success(function(unverifiedUsers){
        		$scope.unverifiedUsers = unverifiedUsers;
        	})
        	.error(function(err){
        		window.alert("Error Occurred: " + err);
        	});
    }
    $scope.verifyAttendance = function(user){
    	$http.put("/api/users/" + user._id + "/verifyAttendance")
            .success(function(){
                updateUnverified();
            })
            .error(function(err){
                window.alert("Error occurred:" + err);
            });
    };
    updateUnverified();
  });
