'use strict';

angular.module('observatory3App')
  .controller('URPCtrl', function ($scope, $stateParams, $http, Auth, User, $location, notify, focus) {
      $scope.data = {
        name: '',
        DOB: '',
        email: '',
        rin: '',
        degree: '',
        year: 'Senior',
        semester: {season: '', year: 2016},
        rcosStyle: 'Credit',
        description: ''
      }
      Auth.getCurrentUser(function(user){
        $scope.user = user;
        $scope.data.name = user.name;
        $scope.data.email = user.email;
      });

      $http.get('/api/classyear')
      .success(function(currentClass){
        $scope.data.semester.season = currentClass.season;
        $scope.data.semester.year = currentClass.year;
      }).error(function(err){
          console.error('Error getting class year', err);
      });

      $scope.semesterOptions = ["Spring" , "Summer", "Fall"];
      $scope.rcosStyleOptions = ["Credit" , "Experience", "Pay"];
      $scope.yearOptions = ["Freshman" , "Sophomore", "Junior", "Senior"];
      $scope.DOBopen = false;
      $scope.initDate = new Date(1995,8,1);
  });
