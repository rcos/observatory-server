'use strict';

angular.module('observatory3App')
.controller('AdminAttendanceCtrl', function (Auth,$location) {
  if (Auth.isLoggedIn()){
      var loggedInUser = Auth.getCurrentUser();

      if(loggedInUser.role!=='admin'){
          $location.path('/');
      }
  }
  else{
      $location.path('/');
  }
});
