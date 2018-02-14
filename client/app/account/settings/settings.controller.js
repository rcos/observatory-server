'use strict';

angular.module('observatory3App')
  .controller('SettingsCtrl', function ($scope, $location, $stateParams, $http, $uibModal, notify, User, Auth) {
    $scope.errors = {};
    $scope.token = $location.search().token;
    $scope.passwords = {};
    $scope.delete_errors = {};
    $scope.user = Auth.getCurrentUser();

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        if (!$scope.token){
          Auth.changePassword( $scope.user.oldPassword, $scope.user.password )
          .then( function() {
            $scope.message = 'Password successfully changed';
          })
          .catch( function() {
            form.password.$setValidity('mongoose', false);
            $scope.errors.other = 'Incorrect password';
            $scope.message = '';
          });
        }else{
          Auth.changePasswordWithToken($scope.token, $scope.user.password)
            .then( function() {
              $scope.message = 'Password successfully changed';
            })
            .catch (function(){
              $scope.errors.other = 'An error occurred';
              $scope.message = '';
            });
        }
      }
		};

    $scope.toggleActive = function(){
      $scope.user.active = !$scope.user.active;
    }

    $scope.editProfile = function(){
      User.update($scope.user, function(user){
        notify({ message: "Saved user profile"});
        $scope.user = user;
      });
    }

    $scope.deleteUser = function(){
      var modalInstance = $uibModal.open({
        templateUrl: 'app/account/settings/confirmDelete/confirmDelete.html',
        controller: 'deleteUserController',
      });

      modalInstance.result.then(function (userDeleted) {
        Auth.logout();
        $location.path( '/');
      }, function(){

      });
    }
  });
