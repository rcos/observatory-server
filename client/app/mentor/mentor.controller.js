'use strict';

angular.module('observatory3App')
  .controller('MentorCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify) {
    var updateUnverified = function(){
        $http.get('/api/attendance/unverified/today')
        	.success(function(unverifiedSubmissions){
        		$scope.unverifiedSubmissions = unverifiedSubmissions;
        	})
        	.error(function(err){
                notify({ message: 'Error Occurred: ' + err, classes: ['alert-danger'] });
        	});
    };

    $scope.verifyAttendance = function(submission){
    	$http.put('/api/attendance/' + submission._id + '/verify')
            .success(function(){
                updateUnverified();
            })
            .error(function(err){
                notify({ message: 'Error Occurred: ' + err, classes: ['alert-danger'] });
            });
    };
    updateUnverified();
  });
