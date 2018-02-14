'use strict';

angular.module('observatory3App')
  .controller('EditAchievementCtrl',  function ($scope, Achievement) {
    const TITLE_NEW = "Add New Achievement";
    const TITLE_EDIT = "Edit Achievement";

    var newAchievement = function() {
      return {
        title: '',
        description: '',
        date: Date.now()
      };
    }

    $scope.title = TITLE_NEW;
    // Watch parent scope and when achievement changes cast the date string to a js date
    $scope.$watch('achievement', function(){
      if ($scope.achievement._id){
        $scope.title = TITLE_EDIT;
      }
      $scope.achievement.date = new Date($scope.achievement.date);
    });

    $scope.cancel = function() {
      $scope.title = TITLE_NEW;
      $scope.achievement =  newAchievement();
    }

    $scope.submit = function() {
      $scope.title = TITLE_NEW;
      Achievement.save($scope.achievement, function(){
        $scope.achievement =  newAchievement();
        $scope.achievements = Achievement.query();
      });
    };
  });
