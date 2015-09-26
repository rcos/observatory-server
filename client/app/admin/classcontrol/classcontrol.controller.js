'use strict';

angular.module('observatory3App')
  .controller('AdminClassControlCtrl', function ($scope, $http, Auth, User, $location) {

    if (Auth.isLoggedIn()){
      var loggedInUser = Auth.getCurrentUser();

          if(loggedInUser.role!=='admin'){
            $location.path('/');
          }
          else{
            // Use the User $resource to fetch all users

            $scope.users = [];
            $scope.users = User.allstats();
          }
    }
    else{
      $location.path('/');
    }

    function updateClassYear(){
      $http.get("/api/classyear")
        .success(function(currentClass){
          // Check if there is already an attendance code
          var today = new Date();
          today.setHours(0,0,0,0);
          for (var i = 0; i < currentClass.dayCodes.length;i++){
            if (new Date(currentClass.dayCodes[i].date).getTime() == today.getTime()){
              $scope.attendanceCode = currentClass.dayCodes[i].code;
            }
          }

          $scope.currentClass = currentClass;
          $scope.displayURP = currentClass.displayURP;
        }).error(function(err){
          console.error("Error getting class year", err);
        });
    }

    $scope.generateAttendanceCode= function(bonusDay){
      $http.post("/api/classyear/daycode", {
        bonusDay: bonusDay ? true : false
      }).success(function(dayCode){
          $scope.attendanceCode = dayCode;
        });
    };

    // Toggles the display of URP form
    $scope.URPDisplay = function(){
      $scope.displayURP = !$scope.displayURP;
      $http.put("/api/classyear/displayURP", {
         displayURP: $scope.displayURP ? true : false
      }).error(function(err){
        console.error("Error getting class year", err);
      });
    };

    updateClassYear();

  });
