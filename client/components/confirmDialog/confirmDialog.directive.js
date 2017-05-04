'use strict'

angular.module('observatory3App')
.controller('confirmDialogCtrl', function($scope,$uibModalInstance,msg){
  $scope.msg = msg;

  $scope.confirm = function () {
    $uibModalInstance.close(true);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
