'use strict';

angular.module('observatory3App')
  .controller('UserCtrl', function ($scope, $stateParams, $location, $rootScope, $filter, User) {
    $scope.currentUsers = User.query();
    $scope.pastUsers = User.past();
    $scope.users = $scope.currentUsers;
    $scope.searchString = {name:""};
    $scope.currentPage = 0;
    if ($stateParams.page) {
     $scope.currentPage = parseInt($stateParams.page, 10);
    }
    $scope.defaultPageSize = 36;
    $scope.pageSize = $scope.defaultPageSize;
    $scope.sortOrder = 'name';
    if ($stateParams.sort) {
     $scope.sortOrder = $stateParams.sort;
    }


    $scope.past = false;

    if ($stateParams.state === 'past') {
      $scope.past = true;
      $scope.users = $scope.pastUsers;
    } else {
      $scope.past = false;
      $scope.users = $scope.currentUsers;
    }

    $scope.toggleSortOrder = function() {
      if ($scope.sortOrder === '-name') {
        $scope.sortOrder = 'name';
        $location.search("sort", $scope.sortOrder);
      } else if ($scope.sortOrder === 'name') {
        $scope.sortOrder = '-name';
        $location.search("sort", $scope.sortOrder);
      }
    };

    $scope.onSearch = function(past){
        if (!past){
          $scope.users = $scope.currentUsers;
          $scope.users = $filter('filter')($scope.users, $scope.searchString.name);
        } else {
          $scope.users = $scope.pastUsers;
          $scope.users = $filter('filter')($scope.users, $scope.searchString.name);
        }
      };

    $scope.numberOfPages=function(){
        return Math.ceil($scope.users.length/$scope.pageSize);
    };

    $scope.increment = function(){
        if ($scope.currentPage < $scope.numberOfPages()-1){
            $scope.currentPage += 1;
            $location.search("page", $scope.currentPage);
        }
    };

    $scope.decrement = function(){
        if ($scope.currentPage > 0){
            $scope.currentPage -= 1;
            $location.search("page", $scope.currentPage);
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

    $rootScope.$on('$locationChangeSuccess', function() {
      if ($stateParams.page) {
        $scope.currentPage = parseInt($stateParams.page, 10);
      }
      if ($stateParams.sort) {
        $scope.sortOrder = $stateParams.sort;
      }
    });

    $scope.init = function () {
      $location.search("page", $scope.currentPage);
      $location.search("sort", $scope.sortOrder);
    };
    $scope.init();

    })
  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    };
  });
