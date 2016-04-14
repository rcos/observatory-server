/*jshint multistr: true */
'use strict';

angular.module('observatory3App')
.controller('ProjectsProfileCtrl', function ($scope, $http, $stateParams, $location, $uibModal, Auth, Upload, Project, notify) {
    $scope.imgPrefix = '/uploads/' + $stateParams.username + '/' + $stateParams.project + '/';
    $scope.userOnProject = false;
    $scope.project = {};
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
        },function(){
          $location.path('/projects');
        });
    };
    updateProject();

    $scope.selectImage = function() {
      angular.element('#uploadImage').trigger('click');
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
        // $window.location.reload();
        var redirectUsername = projectAdded.githubUsername;
        var redirectProjectName = projectAdded.githubProjectName;
        if (redirectUsername === $stateParams.username && redirectProjectName === $stateParams.project){
          $scope.project=projectAdded;
          updateProject();
        }
        else{
          $location.path( 'projects/' + redirectUsername + '/' + redirectProjectName + '/profile');
        }

      }, function(){

      });
    };

    var getAuthors = function() {
        var project = $scope.project;
        $http.get('/api/projects/' + project._id + '/authors')
            .success(function(authors){
                $scope.authors = authors;
            })
    }

    $scope.getPic = function(user) {
        if (! ('avatar' in user)){
            user.avatar = "//www.gravatar.com/avatar/00000000000000000000000000000000?d=monsterid";
            $http.get('/api/users/' + user._id + '/avatar').success(function(avatar){
                user.avatar = avatar;
            });
        } else {
        }
        return user.avatar
    }

    var initializeSlides = function(photos) {
        var slides = [];
        console.log(photos);
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
    }

    var getAuthors = function() {
        var project = $scope.project;
        $http.get('/api/projects/' + project._id + '/authors')
        .success(function(authors){
            $scope.authors = authors;
        });
    };

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;


    $scope.joinProject = function(){
        $http.put('/api/users/' + $scope.user._id + '/project',{
            'project': $scope.project._id
        }).success(function(){
            notify({ message: "You are now on this project!"  });
            $scope.userOnProject = true;
            $scope.user.projects.push($scope.project._id);
            getAuthors();
        }).error(function(){
            notify({message: 'Error adding user to project!', classes: ["alert-danger"]});
        });
    };

    $scope.leaveProject = function(){
        var loggedInUser = Auth.getCurrentUser();
        $http.delete('/api/users/' + loggedInUser._id + '/project',
        {
            'project': $scope.project._id
        }).success(function(){
            notify({message: "You are now off this project!", classes: []});
            $scope.user.projects.splice($scope.user.projects.indexOf($scope.project._id), 1);
            $scope.userOnProject = false;
            getAuthors();
        }).error(function(){
            notify({message: 'Error removing user from project!', classes: ["alert-danger"]});
        });
    };

    $scope.markPast = function(){
        $http.put('api/projects/'+$scope.project._id+'/markPast').success(function(){
            notify("Project marked as past project");
            updateProject();
        }).error(function(){
            notify("Project not marked as a past project")
        });
    };

    $scope.markActive =  function(){
        $http.put('api/projects/'+$scope.project._id+'/markActive').success(function(){
            notify("Project marked as a current project");
            updateProject();
        }).error(function(){
            notify("ERROR: Project not marked as a current project")
        });
    };

    $scope.markDefault = function(){
        $http.put('api/projects/'+$scope.project._id+'/markdefault').success(function(){
            notify("Project marked as default");
            updateProject();
        }).error(function(){
            notify("Could not mark project as default!");
        });
    };

    $scope.unmarkDefault = function(){
        $http.put('api/projects/'+$scope.project._id+'/unmarkdefault').success(function(){
            notify("Project unmarked as default");
            updateProject();
        }).error(function(){
            notify("Could not unmark project as default!");
        });
    };

    $scope.checkUserProject = function() {
        $scope.userOnProject = $scope.user.projects.indexOf($scope.project._id) !== -1;
    };

    $scope.upload = function($file) {
        Upload.upload({
            url: 'api/projects/'+$stateParams.username+'/'+$stateParams.project+'/upload',
            data: {file: $file}
        }).success(function (data) {
            location.reload();
        }).error(function (data, status) {
            console.log('error status: ' + status);
        });
    };

    $scope.deletePhoto = function(){
        var username = $scope.project.githubUsername;
        var projectName = $scope.project.githubProjectName;
        var activePhoto = $scope.slides[$scope.active];
        if (activePhoto){
            $http.delete('/api/projects/' +  username + '/' + projectName + '/' + activePhoto.src)
            .success(function(){
                location.reload();
            });
        }
    };
//tech bubble code
	$scope.isMentor = Auth.isMentor;
	$scope.addTechBubble = function(){
        if($scope.insertTechContent){
          $http.put('/api/projects/addTechBubble/' + $scope.project._id + '/' + $scope.insertTechContent).success(function(){
              $scope.project.tech.push($scope.insertTechContent);
              $scope.insertTechContent = '';
          }).error(function(){
              notify({message: "Could not add tech!", classes: ["alert-danger"]});
          });
        }
      };
   $scope.removeTech = function(tech){
          $http.put('/api/projects/' + $scope.project._id + '/' + tech + '/removeTech').success(function(){
				$scope.project.tech.splice($scope.project.tech.indexOf(tech),1);
          }).error(function(){
              notify({message: "Could not remove tech!", classes: ["alert-danger"]});
          });
      };

//end tech bubble code
});
