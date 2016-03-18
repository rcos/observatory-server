'use strict';

angular.module('observatory3App')
  .directive('sortArrow', function () {
    return {
      templateUrl: 'components/sortArrow/sortArrow.html',
      scope: {
        sortorder: '=',
        sortby: '=',
        text: '='
      },
      restrict: 'A',
      controller: function ($scope, $element) {
        $scope.setSortOrder = function(field){
          if (field === $scope.sortorder){
            $scope.sortorder = '-' + field;
          } else{
            $scope.sortorder = field;
          }
        };
      }
    };
  });
