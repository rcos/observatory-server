'use strict';

angular.module('observatory3App')
  .controller('AchievementsCtrl', function ($scope, Auth, uibDateParser, Achievement) {
    $scope.achievements = Achievement.query();
    $scope.messages = [{
      title: 'Founded',
      description: 'RCOS was founded',
      date: new Date(2012, 8, 1),
    }, {
      title: 'First Meeting',
      description: 'had that first meeting',
      date: new Date(2012, 8, 7),
    }];

    $scope.achievement = {
      title: '',
      description: '',
      date: null
    };

    $scope.delete = function(ach) {
      ach.$delete(function() {
        $scope.achievements = Achievement.query();
      });
    };

    $scope.submit = function() {
      Achievement.save($scope.achievement, function(){
          $scope.achievement = {};
        });
      $scope.achievements = Achievement.query();
    };

    $scope.isAdmin = Auth.isAdmin();
  });
