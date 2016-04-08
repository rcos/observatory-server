'use strict';

angular.module('observatory3App')
.controller('deleteUserController', function($scope, $location, $http, $uibModalInstance, Auth, notify){
  $scope.submit = function(form) {
    form.password.$setValidity('mongoose', true);

    if(form.$valid) {
      $scope.dismiss = false;
      Auth.deleteUser($scope.password)
      .then(function(response){
        $scope.submitted = false;
        notify({message: 'Account deleted'});
        $uibModalInstance.close(response);

      },function(){
          $scope.submitted = true;

          $scope.errors = {};

          form.password.$setValidity('mongoose', false);
          $scope.errors.password = 'Incorrect password';
      });

    }
  };
  $scope.close = function(){
    $uibModalInstance.dismiss('cancel');
  };

});
