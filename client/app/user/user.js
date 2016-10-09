'use strict';

angular.module('observatory3App')
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('user', {
        url: '/users/:state?page',
        templateUrl: 'app/user/user.html',
        controller: 'UserCtrl',
        reloadOnSearch: false
      });

    // If the user navigates to /me, redirect them to their profile page
    $urlRouterProvider.when('/me', function($location, Auth){
    	Auth.isLoggedInAsync(function(loggedIn){
    		if (loggedIn){
      		var loggedInUser = Auth.getCurrentUser();
				$location.path("/users/" + loggedInUser._id + "/profile");
			}else{
				$location.path("/login");
			}
    	});
    });
  });
