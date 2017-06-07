/*jshint multistr: true */
'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams, $location, $uibModal, Auth, Upload, Project, notify) {
  $scope.imgPrefix = '/uploads/';
  $scope.userOnProject = false;
  $scope.project = {};

  $scope.isLoggedIn = Auth.isLoggedIn;
  $scope.isAdmin = Auth.isAdmin;
  $scope.isMentor = Auth.isMentor;

  var getAuthors = function() {
    var project = $scope.project;
    $http.get('/api/projects/' + project._id + '/authors')
      .success(function(authors){
        $scope.authors = authors;
      });
  };

  var initializeSlides = function(photos) {
    var slides = [];
    if(photos.length > 0) {
      for (var i = 0; i < photos.length; i++){
        slides.push({
          id: i,
          active: false,
          image: $scope.imgPrefix + photos[i],
          src: photos[i]
        });
        if (i === 0) {
          slides[0].active = true;
        }
      }
    }
    else {
      slides.push({
        id: 0,
        active: true,
        placeholder: true,
        image: '../../assets/images/projectplaceholder.png',
        src: '../../assets/images/projectplaceholder.png'
      });
    }
    $scope.slides = slides;
  };

  var updateProject = function(){
    Project.getProject($stateParams.username, $stateParams.project).then(function(result) {
      $scope.project = result.data;
      initializeSlides($scope.project.photos);
      getAuthors();
      Auth.isLoggedInAsync(function(loggedIn){
        if (loggedIn){
          var user = Auth.getCurrentUser();
          $scope.user = user;
          $scope.checkUserProject();
        }
      });
      $('#github-commits').githubInfoWidget({ user: $scope.project.githubUsername, repo: $scope.project.githubProjectName, branch: 'master', last: 15 },
          function() {
            $('.github-user').each(function(index, user) {
              $(user).find('.github-avatar').attr('src', $(user).find('a').attr('href')+'.png');
            });
          });

    },function(){
      $location.path('/projects');
    });
  };

  $scope.selectImage = function() {
    angular.element('#uploadImage').trigger('click');
  };

  $scope.canEdit = function(){
    return $scope.isLoggedIn() || $scope.userOnProject;
  };

  $scope.editProject = function() {
    $scope.editedProject = angular.copy($scope.project);

    var modalInstance = $uibModal.open({
      templateUrl: 'components/editProject/editProject.html',
      controller: 'projectEditController',

      resolve: {
        editProject: function () {
          return  $scope.editedProject;
        },
      }
    });

    modalInstance.result.then(function (projectAdded) {
      var redirectUsername = projectAdded.githubUsername;
      var redirectProjectName = projectAdded.githubProjectName;
      if (redirectUsername === $stateParams.username && redirectProjectName === $stateParams.project){
        $scope.project=projectAdded;
        updateProject();
      }
      else{
        $location.path( 'projects/' + redirectUsername + '/' + redirectProjectName + '/profile');
      }
    }, function(){});
  };

  $scope.getPic = function(user) {
    if (! ('avatar' in user)){
      user.avatar = '//www.gravatar.com/avatar/00000000000000000000000000000000?d=monsterid';
      $http.get('/api/users/' + user._id + '/avatar').success(function(avatar){
        user.avatar = avatar;
      });
    } else {
    }
    return user.avatar;
  };

  $scope.joinProject = function(){
    $http.put('/api/users/' + $scope.user._id + '/project',{
      'project': $scope.project._id
    }).success(function(){
      notify({ message: 'You are now on this project!'});
      $scope.userOnProject = true;
      $scope.user.projects.push($scope.project._id);
      getAuthors();
    }).error(function(){
      notify({message: 'Error adding user to project!', classes: ['alert-danger']});
    });
  };

  $scope.leaveProject = function(){
    var loggedInUser = Auth.getCurrentUser();
    $http.delete('/api/users/' + loggedInUser._id + '/project',
        {
          'project': $scope.project._id
        }).success(function(){
      notify({message: 'You are now off this project!', classes: []});
      $scope.user.projects.splice($scope.user.projects.indexOf($scope.project._id), 1);
      $scope.userOnProject = false;
      getAuthors();
    }).error(function(){
          notify({message: 'Error removing user from project!', classes: ['alert-danger']});
        });
  };

  $scope.markPast = function(){
    $http.put('api/projects/'+$scope.project._id+'/markPast').success(function(){
      notify('Project marked as past project');
      updateProject();
    }).error(function(){
      notify('Project not marked as a past project');
    });
  };

  $scope.markActive =  function(){
    $http.put('api/projects/'+$scope.project._id+'/markActive').success(function(){
      notify('Project marked as a current project');
      updateProject();
    }).error(function(){
      notify('ERROR: Project not marked as a current project');
    });
  };

  $scope.markDefault = function(){
    $http.put('api/projects/'+$scope.project._id+'/markdefault').success(function(){
      notify('Project marked as default');
      updateProject();
    }).error(function(){
      notify('Could not mark project as default!');
    });
  };

  $scope.unmarkDefault = function(){
    $http.put('api/projects/'+$scope.project._id+'/unmarkdefault').success(function(){
      notify('Project unmarked as default');
      updateProject();
    }).error(function(){
      notify('Could not unmark project as default!');
    });
  };

  $scope.checkUserProject = function() {
    $scope.userOnProject = $scope.user.projects.indexOf($scope.project._id) !== -1;
  };

  $scope.upload = function($file) {
    if ($file) {
      if($file.$error === 'maxSize') {
        notify({ message: 'Error: This image is too large, please upload a smaller image.', classes: ['alert-danger'] });
        return;
      }
      Upload.upload({
        url: 'api/projects/'+$stateParams.username+'/'+$stateParams.project+'/upload',
        data: {file: $file}
      }).success(function () {
        location.reload();
      }).error(function (data, status) {
        console.log('error status: ' + status);
      });
    }
  };

  $scope.deletePhoto = function(){
    var activePhoto = $scope.slides[$scope.active];
    if (activePhoto){
      $http.delete('/api/projects/'+ activePhoto.src)
        .success(function(){
          location.reload();
        });
    }
  };
  $scope.isMentor = Auth.isMentor;
  updateProject();

});
