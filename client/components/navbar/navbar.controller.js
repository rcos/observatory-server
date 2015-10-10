'use strict';

angular.module('observatory3App')
  .controller('NavbarCtrl', function ($scope, $location, $http, Auth) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    },{
      'title': 'Projects',
      'link': '/projects'
    },{
      'title': 'Users',
      'link': '/users'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isMentor = Auth.isMentor;
    $scope.getCurrentUser = Auth.getCurrentUser;
    
		$scope.logout = function() {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    // Toggles the display of URP form
    var URPDisplay = function(){
      $http.get("/api/classyear/displayURP").
        then(function(data){
          if (data) {
            $scope.displayURP = data.displayURP;
          }
        });
    };

    URPDisplay();

  });
