'use strict'

angular.module('observatory3App')
.controller('confirmDialogCtrl', function($scope, $uibModalInstance, msg){
  if(!msg.title){
    msg.title = 'confirm';
  }
  $scope.msg = msg;

  $scope.confirm = function () {
    $uibModalInstance.close(true);
  };
  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
