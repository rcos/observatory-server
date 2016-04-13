'use strict';

angular.module('observatory3App')
  .controller('UserCtrl', function ($scope, User) {
    $scope.currentUsers = User.query();
    $scope.pastUsers = User.past();
    $scope.users = $scope.currentUsers;
    $scope.searchString = {name:""};
    $scope.currentPage = 0;
    $scope.defaultPageSize = 48;
    $scope.pageSize = $scope.defaultPageSize;

    $scope.past = false;

    $scope.numberOfPages=function(){
        return Math.ceil($scope.users.length/$scope.pageSize);
    };

    $scope.increment = function(){
        if ($scope.currentPage < $scope.numberOfPages()-1){
            $scope.currentPage += 1;
        }
    };

    $scope.decrement = function(){
        if ($scope.currentPage > 0){
            $scope.currentPage -= 1;
        }
    };

    $scope.toggleViewAll = function() {
        if ($scope.pageSize === $scope.defaultPageSize) {
            $scope.pageSize = $scope.users.length;
            $scope.currentPage = 0;
        }
        else{
           $scope.pageSize = $scope.defaultPageSize;
        }
    };

    $scope.changeView = function(view){
        if ($scope.past){
            $scope.past = false;
            $scope.users = $scope.currentUsers;
        } else{
            $scope.past = true;
            $scope.users = $scope.pastUsers;
        }
        $scope.currentPage = 0;
    };
    })
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
});
