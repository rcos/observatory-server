'use strict';

angular.module('observatory3App')
  .controller('UserCtrl', function ($scope, User) {
    $scope.currentUsers = User.query();
    $scope.pastUsers = User.past();
    $scope.users = $scope.currentUsers;

    $scope.currentPage = 0;
    $scope.pageSize = 48;

    $scope.currentView = 'Active Developers'

    $scope.numberOfPages=function(){
        return Math.ceil($scope.users.length/$scope.pageSize);                
    }

    $scope.increment = function(){
        if ($scope.currentPage < $scope.numberOfPages()-1){
            $scope.currentPage += 1;
        }
    }

    $scope.decrement = function(){
        if ($scope.currentPage > 0){
            $scope.currentPage -= 1;
        }
    }

    $scope.changeView = function(view){
        if (view === 'past'){
            $scope.currentView = 'Past Developers';
            $scope.users = $scope.pastUsers;
        } else{
            $scope.currentView = 'Active Developers';
            $scope.users = $scope.currentUsers;
        }
        $scope.currentPage = 0;
    }
    })
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});
