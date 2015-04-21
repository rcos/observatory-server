'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams, $upload) {
    $http.get('/api/projects/'+ $stateParams.username + '/' + $stateParams.project).success(function(project){
      $scope.project = project;
    });

    $scope.imgPrefix = "/uploads/" + $stateParams.username + '/' + $stateParams.project + '/';

    $scope.onFileSelect = function($files) {
    console.log("file chosen");
    //$files: an array of files selected, each file has name, size, and type.
    for (var i = 0; i < $files.length; i++) {
      var $file = $files[i];
      $upload.upload({
        url: 'api/projects/'+$stateParams.username+'/'+$stateParams.project+'/upload',
        file: $file,
        progress: function(e){}
      }).then(function(data, status, headers, config) {
        // file is uploaded successfully
        console.log(data);
      }); 
    }
  }

});
