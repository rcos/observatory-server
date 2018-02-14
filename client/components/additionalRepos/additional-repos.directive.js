'use strict';

angular.module('observatory3App')
  .directive('additionalRepos', function () {
    return {
      templateUrl: 'components/additionalRepos/additional-repos.html',
      restrict: 'E',
      scope: {
        model: '=',
        submitted: '='
      },
      require: '^form',
      link: function(scope, elem, attr, form) {

        scope.editProjectForm = form;

        scope.$watch(attr.submitted, function(value){
            scope.submitted = value;
        }, true);

      },
      controller: function ($scope) {
        $scope.addRepository = function() {
          $scope.model.push("");
        };

        $scope.removeRepository = function(index) {
          $scope.model.splice(index, 1);
        };
      }
    };
  });
